package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class Observation {

    private final Map<String, String> dimensions = new HashMap(); // dimResource -> entityUUID
    private final Map<String, Double> measures = new HashMap();

    /**
     * @return the dimensions
     */
    public Map<String, String> getDimensions() {
        return dimensions;
    }

    /**
     * @return the measures
     */
    public Map<String, Double> getMeasures() {
        return measures;
    }
}
