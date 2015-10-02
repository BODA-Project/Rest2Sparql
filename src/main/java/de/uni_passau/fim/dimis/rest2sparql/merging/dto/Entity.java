package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

/**
 *
 * @author toniw
 */
public class Entity {

    private String resource;
    private String label;
    private String definedBy;

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

    /**
     * @return the definedBy
     */
    public String getDefinedBy() {
        return definedBy;
    }

    /**
     * @param definedBy the definedBy to set
     */
    public void setDefinedBy(String definedBy) {
        this.definedBy = definedBy;
    }
}
