package de.uni_passau.fim.dimis.rest2sparql.merging.config;

import java.util.List;

/**
 * General merging configuration bean.
 */
public class MergeConfig {

    private String id;
    private String hash;
    private String cube1;
    private String cube2;
    private String preference;
    private String label;
    private String comment;
    private List<DimensionConfig> dimensions;
    private List<MeasureConfig> measures;

    /**
     * @return the id
     */
    public String getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * @return the hash
     */
    public String getHash() {
        return hash;
    }

    /**
     * @param hash the hash to set
     */
    public void setHash(String hash) {
        this.hash = hash;
    }

    /**
     * @return the cube1
     */
    public String getCube1() {
        return cube1;
    }

    /**
     * @param cube1 the cube1 to set
     */
    public void setCube1(String cube1) {
        this.cube1 = cube1;
    }

    /**
     * @return the cube2
     */
    public String getCube2() {
        return cube2;
    }

    /**
     * @param cube2 the cube2 to set
     */
    public void setCube2(String cube2) {
        this.cube2 = cube2;
    }

    /**
     * @return the preference
     */
    public String getPreference() {
        return preference;
    }

    /**
     * @param preference the preference to set
     */
    public void setPreference(String preference) {
        this.preference = preference;
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
     * @return the dimensions
     */
    public List<DimensionConfig> getDimensions() {
        return dimensions;
    }

    /**
     * @param dimensions the dimensions to set
     */
    public void setDimensions(List<DimensionConfig> dimensions) {
        this.dimensions = dimensions;
    }

    /**
     * @return the measures
     */
    public List<MeasureConfig> getMeasures() {
        return measures;
    }

    /**
     * @param measures the measures to set
     */
    public void setMeasures(List<MeasureConfig> measures) {
        this.measures = measures;
    }
}
