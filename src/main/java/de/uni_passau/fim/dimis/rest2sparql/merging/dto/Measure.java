package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

/**
 *
 * @author toniw
 */
public class Measure {

    private String resource;
    private String label;
    private String subpropertyOf;

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
     * @return the subpropertyOf
     */
    public String getSubpropertyOf() {
        return subpropertyOf;
    }

    /**
     * @param subpropertyOf the subpropertyOf to set
     */
    public void setSubpropertyOf(String subpropertyOf) {
        this.subpropertyOf = subpropertyOf;
    }
}
