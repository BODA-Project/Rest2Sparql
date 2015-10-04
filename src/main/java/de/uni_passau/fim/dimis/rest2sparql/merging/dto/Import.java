package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

/**
 * Import and Importer information. Contained in the Dataset DTO.
 */
public class Import {

    private String resource;
    private String startedBy;
    private String label;

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
     * @return the startedBy
     */
    public String getStartedBy() {
        return startedBy;
    }

    /**
     * @param startedBy the startedBy to set
     */
    public void setStartedBy(String startedBy) {
        this.startedBy = startedBy;
    }

    /**
     * @return the label
     */
    public String getLabel() {
        return label;
    }

    /**
     * @param label the label to set
     */
    public void setLabel(String label) {
        this.label = label;
    }

}
