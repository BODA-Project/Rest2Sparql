package de.uni_passau.fim.dimis.rest2sparql.merging.config;

/**
 * Configuration bean for dimensions when merging cubes. Different scenarios
 * (match 2 dimensions, add missing dimension, add new dimension)
 */
public class DimensionConfig {

    private String dimension;
    private String dimensionMatch;
    private String label;
    private String entity;
    private String entityLabel;
    private String entity2;
    private String entity2Label;

    /**
     * @return the dimension
     */
    public String getDimension() {
        return dimension;
    }

    /**
     * @param dimension the dimension to set
     */
    public void setDimension(String dimension) {
        this.dimension = dimension;
    }

    /**
     * @return the dimensionMatch
     */
    public String getDimensionMatch() {
        return dimensionMatch;
    }

    /**
     * @param dimensionMatch the dimensionMatch to set
     */
    public void setDimensionMatch(String dimensionMatch) {
        this.dimensionMatch = dimensionMatch;
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
     * @return the entity
     */
    public String getEntity() {
        return entity;
    }

    /**
     * @param entity the entity to set
     */
    public void setEntity(String entity) {
        this.entity = entity;
    }

    /**
     * @return the entityLabel
     */
    public String getEntityLabel() {
        return entityLabel;
    }

    /**
     * @param entityLabel the entityLabel to set
     */
    public void setEntityLabel(String entityLabel) {
        this.entityLabel = entityLabel;
    }

    /**
     * @return the entity2
     */
    public String getEntity2() {
        return entity2;
    }

    /**
     * @param entity2 the entity2 to set
     */
    public void setEntity2(String entity2) {
        this.entity2 = entity2;
    }

    /**
     * @return the entity2Label
     */
    public String getEntity2Label() {
        return entity2Label;
    }

    /**
     * @param entity2Label the entity2Label to set
     */
    public void setEntity2Label(String entity2Label) {
        this.entity2Label = entity2Label;
    }
}
