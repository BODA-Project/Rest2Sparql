package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

/**
 * Dataset / Metadata
 */
public class Dataset {

    private String resource;
    private String label;
    private String comment;
    private String format;
    private String relation;
    private String source;
    private String structure;
    private String generatedBy;
    private Import imp;

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
     * @return the comment
     */
    public String getComment() {
        return comment;
    }

    /**
     * @param comment the comment to set
     */
    public void setComment(String comment) {
        this.comment = comment;
    }

    /**
     * @return the format
     */
    public String getFormat() {
        return format;
    }

    /**
     * @param format the format to set
     */
    public void setFormat(String format) {
        this.format = format;
    }

    /**
     * @return the relation
     */
    public String getRelation() {
        return relation;
    }

    /**
     * @param relation the relation to set
     */
    public void setRelation(String relation) {
        this.relation = relation;
    }

    /**
     * @return the source
     */
    public String getSource() {
        return source;
    }

    /**
     * @param source the source to set
     */
    public void setSource(String source) {
        this.source = source;
    }

    /**
     * @return the structure
     */
    public String getStructure() {
        return structure;
    }

    /**
     * @param structure the structure to set
     */
    public void setStructure(String structure) {
        this.structure = structure;
    }

    /**
     * @return the GeneratedBy
     */
    public String getGeneratedBy() {
        return generatedBy;
    }

    /**
     * @param generatedBy the GeneratedBy to set
     */
    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
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
     * @return the imp
     */
    public Import getImport() {
        return imp;
    }

    /**
     * @param imp the imp to set
     */
    public void setImport(Import imp) {
        this.imp = imp;
    }

}
