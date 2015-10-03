package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Dataset Structure Definition
 */
public class DatasetStructureDefinition {

    private String resource;
    private final List<String> dimensions = new ArrayList();
    private final List<String> measures = new ArrayList();

    /**
     * @return the dimensions
     */
    public List<String> getDimensions() {
        return dimensions;
    }

    /**
     * @return the measures
     */
    public List<String> getMeasures() {
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
}
