package de.uni_passau.fim.dimis.rest2sparql.merging;

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
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The merge business object
 */
public class MergeService {

    private final static String DATASET_RELATION = "Cube was merged with the CubeMerger (Rest2Sparql)";
    private final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * Merges and stores the given datasets (inside the config)
     *
     * @param config the merging configuration
     * @throws
     * de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException
     */
    public void merge(MergeConfig config) throws ConnectionException {

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

        // Preferred and unprederred entities
        List<Entity> prefEntities = isCube1Preferred(config) ? entitiesC1 : entitiesC2; // preferred in case of overlap
        List<Entity> otherEntities = isCube1Preferred(config) ? entitiesC2 : entitiesC1;
        List<Entity> allEntities = new ArrayList();
        allEntities.addAll(otherEntities);
        allEntities.addAll(prefEntities);

        // Map definition (isDefinedBy) + label of entity to actual entity objects (for entitiy collision detection)
        Map<String, Entity> entityDefMap = new HashMap(); // def + label -> Entity
        for (Entity entity : allEntities) {
            String key = entity.getDefinedBy() + entity.getLabel(); // Hack, use label in case definition is missing
            entityDefMap.put(key, entity);
        }

        // Map UUID of entity to actual entity objects (only used for already existing entities)
        Map<String, Entity> entityResMap = new HashMap(); // UUID -> Entity
        for (Entity entity : allEntities) {
            String key = entity.getDefinedBy() + entity.getLabel();
            entityResMap.put(entity.getResource(), entityDefMap.get(key)); // merges same entities
        }

        // Change the UUID of all entities, key of map stays the same to access them
        for (Map.Entry<String, Entity> entrySet : entityResMap.entrySet()) {
            Entity entity = entrySet.getValue();
            entity.setResource(Vocabulary.CODE_ENTITY + getRandomId());
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
        newDataset.setRelation(DATASET_RELATION);
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

        // Prepare the observations according to the new DSD
        List<Observation> allObservations = new ArrayList();
        List<Observation> prefObservations = isCube1Preferred(config) ? observationsC1 : observationsC2;
        List<Observation> otherObservations = isCube1Preferred(config) ? observationsC2 : observationsC1;
        allObservations.addAll(otherObservations);
        allObservations.addAll(prefObservations); // Add preferred observations last to override unpreferred
        for (Observation obs : allObservations) {
            obs.setDataset(idDataset);
            obs.setResource(Vocabulary.CODE_OBS + getRandomId());

            // Apply changed UUID of entities
            for (Map.Entry<String, String> entrySet : obs.getDimensions().entrySet()) {
                String dimRes = entrySet.getKey();
                String entityRes = entrySet.getValue();
                String newUUID = entityResMap.get(entityRes).getResource();
                obs.getDimensions().put(dimRes, newUUID);
            }

            // Replace dimensions (URIs)
            for (DimensionConfig dc : config.getDimensions()) {
                String dim = dc.getDimension();
                String match = dc.getDimensionMatch();
                if (match != null && obs.getDimensions().containsKey(dim)) {
                    // Replace dimension resource (and clear old one)
                    String entity = obs.getDimensions().remove(dim);
                    obs.getDimensions().put(match, entity);
                }
            }

            // Replace measures (URIs)
            for (MeasureConfig mc : config.getMeasures()) {
                String measure = mc.getMeasure();
                String match = mc.getMeasureMatch();
                if (match != null && obs.getMeasures().containsKey(measure)) {
                    // Replace measure resource (and clear old one)
                    Double value = obs.getMeasures().remove(measure);
                    obs.getMeasures().put(match, value);
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
                        String definedBy = null;
                        String label = null;
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
                            Entity entity = entityResMap.get(dc.getEntity());
                            if (entity != null) {
                                // User chose an existing entity from the list (already in entityDefMap)
                                key = entity.getDefinedBy() + entity.getLabel();
                            } else {
                                // User entered a new entity label
                                key = dc.getEntity() + dc.getEntityLabel();
                                definedBy = dc.getEntity();
                                label = dc.getEntityLabel();
                            }
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

        // Create list of actually used entities
        List<Entity> newEntities = new ArrayList(entityDefMap.values());

        // Map combination of entities to observation to detect collision
        Map<String, Observation> overlapMap = new HashMap();

        // Merge observations by adding unpreferred first and overriding given components
        for (Observation obs : allObservations) {

            // Key = combination of all entity URIs
            String key = "";
            for (Dimension dim : newDimensions) {
                key += obs.getDimensions().get(dim.getResource());
            }
            Observation overlapObs = overlapMap.get(key);
            if (overlapObs == null) {
                // Save the observation to map for collision detection
                overlapMap.put(key, obs);
            } else {
                // Override the already added observation (add / overwrite measure data)
                for (Map.Entry<String, Double> entrySet : obs.getMeasures().entrySet()) {
                    String measureRes = entrySet.getKey();
                    Double measureValue = entrySet.getValue();
                    overlapObs.getMeasures().put(measureRes, measureValue); // Override
                }
            }
        }
        List<Observation> newObservations = new ArrayList(overlapMap.values());

        // Combine the merged data
        Cube cube = new Cube();
        cube.setDataset(newDataset);
        cube.setDsd(newDsd);
        cube.setDimensions(newDimensions);
        cube.setMeasures(newMeasures);
        cube.setEntities(newEntities);
        cube.setObservations(newObservations);

        // Log some information
        logger.info("Merged Cubes " + config.getCube1() + " and " + config.getCube2());
        logger.info("Dimensions Cube #1: " + dimensionsC1.size());
        logger.info("Dimensions Cube #2: " + dimensionsC2.size());
        logger.info("Dimensions Merged: " + newDimensions.size());
        logger.info("Measures Cube #1: " + meauresC1.size());
        logger.info("Measures Cube #2: " + meauresC2.size());
        logger.info("Measures Merged: " + newMeasures.size());
        logger.info("Entities Cube #1: " + entitiesC1.size());
        logger.info("Entities Cube #2: " + entitiesC2.size());
        logger.info("Entities Merged: " + newEntities.size());
        logger.info("Observations Cube #1: " + observationsC1.size());
        logger.info("Observations Cube #2: " + observationsC2.size());
        logger.info("Observations Merged: " + newObservations.size());

        // Store the merged cube
        dao.store(cube);
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
