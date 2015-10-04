package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * Observation
 */
public class Observation {

    private String resource;
    private String dataset;
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

    /**
     * @return the resource
     */
    public String getResource() {
        return resource;
    }

    /**
     * @param resource the resource to set
     */
    public void setResource(String resource) {
        this.resource = resource;
    }

    /**
     * @return the dataset
     */
    public String getDataset() {
        return dataset;
    }

    /**
     * @param dataset the dataset to set
     */
    public void setDataset(String dataset) {
        this.dataset = dataset;
    }
}
