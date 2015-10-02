package de.uni_passau.fim.dimis.rest2sparql.merging;

import de.uni_passau.fim.dimis.rest2sparql.merging.config.DimensionConfig;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.MeasureConfig;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.MergeConfig;
import de.uni_passau.fim.dimis.rest2sparql.merging.dao.MergeDao;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Entity;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Measure;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Observation;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * The merge business object
 */
public class MergeService {

    /**
     * Merges and stores the given datasets (inside the config)
     *
     * @param config the merging configuration
     */
    public void merge(MergeConfig config) {
        MergeDao dao = new MergeDao();

        // Load all dimensions, measures, entities to change them and save to the new cube
        List<Dimension> dimensionsC1 = dao.getDimensions(config.getCube1());
        List<Dimension> dimensionsC2 = dao.getDimensions(config.getCube2());
        List<Measure> meauresC1 = dao.getMeasures(config.getCube1());
        List<Measure> meauresC2 = dao.getMeasures(config.getCube2());
        List<Entity> entitiesC1 = dao.getEntities(config.getCube1());
        List<Entity> entitiesC2 = dao.getEntities(config.getCube2());

        // TODO: load other meta info (DSD, Dataset, Importer, ...)

        // Map UUID of entity to actual entity objects
        Map<String, Entity> entityMap = new HashMap();
        entityMap.putAll(dao.computeEntityMap(entitiesC1));
        entityMap.putAll(dao.computeEntityMap(entitiesC2));

        // Load all observations
        List<Observation> observationsC1 = dao.getObservations(config.getCube1());
        List<Observation> observationsC2 = dao.getObservations(config.getCube2());




        // TODO:

        // Add dimensions
        for (DimensionConfig dimConf : config.getDimensions()) {
            String dim = dimConf.getDimension();

            if (dimConf.getDimensionMatch() != null) {
                String dimMatch = dimConf.getDimensionMatch();
                // Replace dimension URI
            } else {
                // Add missing dimension
                if (dimConf.getEntity2() != null) {
                    // Missing in both cubes
                    // TODO cube1 obs -> entity1 else entity2 -> add
                } else {
                    // Missing in one cube
                    // TODO if missing in observation -> add
                }
            }
        }

        // Rename / Match measures
        for (MeasureConfig measureConf : config.getMeasures()) {
            String measure = measureConf.getMeasure();
            String measureMatch = measureConf.getMeasureMatch();
            // Replace measure URI
        }

    }

    /**
     * Generates a random ID for resources (entities, datasets, etc.)
     *
     * @return
     */
    private String getRandomId() {
        return UUID.randomUUID().toString();
    }

}
