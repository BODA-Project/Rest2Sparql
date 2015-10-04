package de.uni_passau.fim.dimis.rest2sparql.merging;

import com.google.gson.Gson;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.DimensionConfig;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.MeasureConfig;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.MergeConfig;
import de.uni_passau.fim.dimis.rest2sparql.merging.dao.MergeDao;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Cube;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Dataset;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.DatasetStructureDefinition;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Entity;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Import;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Measure;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Observation;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * The merge business object
 */
public class MergeService {

    // FOR TESTING
    public static void main(String[] args) {
        Gson gson = new Gson();
        InputStream str = MergeService.class.getResourceAsStream("/sampleConfig.json");
        InputStreamReader isr = new InputStreamReader(str);
        MergeConfig config = gson.fromJson(isr, MergeConfig.class);

        // Merge and store the datasets
        MergeService ms = new MergeService();
        ms.merge(config);
    }

    /**
     * Merges and stores the given datasets (inside the config)
     *
     * @param config the merging configuration
     */
    public void merge(MergeConfig config) {

        // TODO: split in methods: dataset, dimensions, measures, entities, observations
        // Database access
        MergeDao dao = new MergeDao();

        // Load all dimensions, measures, entities and observations to change them and save to the new cube
        Dataset datasetC1 = dao.getDataset(config.getCube1());
        Dataset datasetC2 = dao.getDataset(config.getCube2());
        List<Dimension> dimensionsC1 = dao.getDimensions(config.getCube1());
        List<Dimension> dimensionsC2 = dao.getDimensions(config.getCube2());
        List<Measure> meauresC1 = dao.getMeasures(config.getCube1());
        List<Measure> meauresC2 = dao.getMeasures(config.getCube2());
        List<Entity> entitiesC1 = dao.getEntities(config.getCube1());
        List<Entity> entitiesC2 = dao.getEntities(config.getCube2());
        List<Observation> observationsC1 = dao.getObservations(config.getCube1());
        List<Observation> observationsC2 = dao.getObservations(config.getCube2());

        // Map UUID of entity to actual entity objects
        List<Entity> prefEntities = config.getPreference().equals(config.getCube1()) ? entitiesC1 : entitiesC2; // preferred in case of overlap
        List<Entity> otherEntities = config.getPreference().equals(config.getCube1()) ? entitiesC2 : entitiesC1;
        Map<String, Entity> entityResMap = new HashMap(); // UUID -> Entity
        for (Entity entity : otherEntities) {
            entityResMap.put(entity.getResource(), entity);
        }
        for (Entity entity : prefEntities) {
            entityResMap.put(entity.getResource(), entity);
        }

        // Map definition (isDefinedBy) + label of entity to actual entity objects (for overlap detection)
        Map<String, Entity> entityDefMap = new HashMap(); // def + label -> Entity
        for (Entity entity : otherEntities) {
            String key = entity.getDefinedBy() + entity.getLabel(); // Hack, use label in case definition is missing
            entityDefMap.put(key, entity);
        }
        for (Entity entity : prefEntities) {
            String key = entity.getDefinedBy() + entity.getLabel(); // Hack, use label in case definition is missing
            entityDefMap.put(key, entity);
        }

        // Generate new IDs for metadata
        String idDataset = Vocabulary.CODE_DATASET + getRandomId();
        String idImportTemp = getRandomId();
        String idImport = Vocabulary.CODE_IMPORT + idImportTemp;
        String idImporter = Vocabulary.CODE_IMPORTER + idImportTemp;
        String idDSD = Vocabulary.CODE_DSD + getRandomId();

        // Create the new dataset information
        Dataset newDataset = new Dataset();
        newDataset.setResource(idDataset);
        newDataset.setComment(config.getComment());
        newDataset.setLabel(config.getLabel());
        newDataset.setStructure(idDSD);
        newDataset.setGeneratedBy(idImport);
        Dataset prefDataset = isCube1Preferred(config) ? datasetC1 : datasetC2; // preferred in case of overlap
        newDataset.setFormat(prefDataset.getFormat());
        newDataset.setRelation(prefDataset.getRelation());
        newDataset.setSource(prefDataset.getSource());
        Import newImport = new Import();
        newImport.setLabel(prefDataset.getImport().getLabel());
        newImport.setResource(idImport);
        newImport.setStartedBy(idImporter);
        newDataset.setImport(newImport);

        // Merge the list of dimensions of both cubes (and add / rename them according to config)
        List<Dimension> prefDimensions = isCube1Preferred(config) ? dimensionsC1 : dimensionsC2; // preferred in case of overlap
        List<Dimension> otherDimensions = isCube1Preferred(config) ? dimensionsC2 : dimensionsC1;
        Map<String, Dimension> dimMap = new HashMap();
        for (Dimension dim : otherDimensions) {
            dimMap.put(dim.getResource(), dim);
        }
        for (Dimension dim : prefDimensions) {
            dimMap.put(dim.getResource(), dim);
        }
        for (DimensionConfig dc : config.getDimensions()) {
            if (dc.getLabel() != null) {
                // Completely new dimension, add to list
                Dimension newDim = new Dimension();
                newDim.setResource(dc.getDimension());
                newDim.setLabel(dc.getLabel());
                newDim.setSubpropertyOf(Vocabulary.VA_DIMENSION_NOMINAL); // TODO always nominal?
                dimMap.put(dc.getDimension(), newDim); // add
            } else if (dc.getEntity() != null) {
                // Missing dimension in one cubbe, observations will get default entity
            } else if (dc.getDimension() != null) {
                // Dimension replacement, remove old dimension from map, replacement happens at observations
                dimMap.remove(dc.getDimension());
            }
        }
        // Convert to list
        List<Dimension> newDimensions = new ArrayList(dimMap.values());

        // Merge the list of measures of both cubes (and replace them according to config)
        List<Measure> prefMeasures = isCube1Preferred(config) ? meauresC1 : meauresC2; // preferred in case of overlap
        List<Measure> otherMeasures = isCube1Preferred(config) ? meauresC2 : meauresC1;
        Map<String, Measure> measureMap = new HashMap();
        for (Measure measure : otherMeasures) {
            measureMap.put(measure.getResource(), measure);
        }
        for (Measure measure : prefMeasures) {
            measureMap.put(measure.getResource(), measure);
        }
        for (MeasureConfig mc : config.getMeasures()) {
            // Measure replacement, remove old measure from map, replacement happens at observations
            measureMap.remove(mc.getMeasure());
        }
        // Convert to list
        List<Measure> newMeasures = new ArrayList(measureMap.values());

        // Create the dataset structure definition, contains all dimensions and measures
        DatasetStructureDefinition newDsd = new DatasetStructureDefinition();
        newDsd.setResource(idDSD);
        for (Dimension dim : newDimensions) {
            newDsd.getDimensions().add(dim.getResource());
        }
        for (Measure measure : newMeasures) {
            newDsd.getMeasures().add(measure.getResource());
        }

        // TODO: rename existing entity UUIDs ? -> fill empty list when merging observations!!!
        // Prepare the observations according to the new DSD
        List<Observation> allObservations = new ArrayList();
        allObservations.addAll(observationsC1);
        allObservations.addAll(observationsC2);
        for (Observation obs : allObservations) {
            obs.setDataset(idDataset);
            obs.setResource(Vocabulary.CODE_OBS + getRandomId()); // TODO counter instead?

            // Replace dimensions (URIs)
            for (Map.Entry<String, String> entrySet : obs.getDimensions().entrySet()) {
                String dimRes = entrySet.getKey();
                String entityRes = entrySet.getValue();
                for (DimensionConfig dc : config.getDimensions()) {
                    if (dc.getDimensionMatch() != null && dc.getDimension().equals(dimRes)) {
                        // Replace dimension resource (and clear old one)
                        obs.getDimensions().remove(dimRes);
                        obs.getDimensions().put(dc.getDimensionMatch(), entityRes);
                        break;
                    }
                }
            }

            // Replace measures (URIs)
            for (Map.Entry<String, Double> entrySet : obs.getMeasures().entrySet()) {
                String measureRes = entrySet.getKey();
                Double value = entrySet.getValue();
                for (MeasureConfig mc : config.getMeasures()) {
                    if (mc.getMeasureMatch() != null && mc.getMeasure().equals(measureRes)) {
                        // Replace measure resource (and clear old one)
                        obs.getMeasures().remove(measureRes);
                        obs.getMeasures().put(mc.getMeasureMatch(), value);
                        break;
                    }
                }
            }

            // Add missing dimensions
            for (Dimension dim : newDimensions) {
                if (!obs.getDimensions().containsKey(dim.getResource())) {
                    // Add missing dimension and default entity according to config

                    for (DimensionConfig dc : config.getDimensions()) {
                        if (!dc.getDimension().equals(dim.getResource())) {
                            continue;
                        }
                        String key;
                        String definedBy;
                        String label;
                        if (dc.getEntity2() != null) {
                            // Missing in both cubes
                            if (observationsC1.contains(obs)) {
                                key = dc.getEntity() + dc.getEntityLabel();
                                definedBy = dc.getEntity();
                                label = dc.getEntityLabel();
                            } else {
                                key = dc.getEntity2() + dc.getEntity2Label();
                                definedBy = dc.getEntity2();
                                label = dc.getEntity2Label();
                            }
                        } else {
                            // Missing in this cube
                            key = dc.getEntity() + dc.getEntityLabel();
                            definedBy = dc.getEntity();
                            label = dc.getEntityLabel();
                        }

                        // Add the entity to the list if missing
                        if (!entityDefMap.containsKey(key)) {
                            Entity entity = new Entity();
                            entity.setResource(Vocabulary.CODE_ENTITY + getRandomId());
                            entity.setDefinedBy(definedBy);
                            entity.setLabel(label);
                            entityDefMap.put(key, entity);
                        }

                        // Add entity to the observation
                        Entity entity = entityDefMap.get(key);
                        obs.getDimensions().put(dc.getDimension(), entity.getResource());
                        break;
                    }
                }
            }
        }

        // Merge the observations and create a list of actually used Entities
        List<Observation> prefObservations = isCube1Preferred(config) ? observationsC1 : observationsC2;
        List<Observation> otherObservations = isCube1Preferred(config) ? observationsC2 : observationsC1;
        // TODO...

        // Combine the merged data
        Cube cube = new Cube();
        cube.setDataset(newDataset);
        cube.setDsd(newDsd);
        cube.setDimensions(newDimensions);
        cube.setMeasures(newMeasures);
        cube.setEntities(null);
        cube.setObservations(null);

        // TEST: check objects
//        System.out.println("AS JSON: " + new Gson().toJson(entityDefMap));
        // Store the merged cube
        dao.store(cube); // TODO return value? success / fail?
        // return RETURN_SUCCES; // TODO...
    }

    /**
     * Generates a random ID for resources (entities, datasets, etc.)
     *
     * @return a type 4 (pseudo randomly generated) UUID
     */
    private String getRandomId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Retrus true if cube #1 is preferred over #2
     *
     * @param config the merge configuration
     * @return true if cube #1 is preferred over #2
     */
    private boolean isCube1Preferred(MergeConfig config) {
        return config.getPreference().equals(config.getCube1());
    }

}
