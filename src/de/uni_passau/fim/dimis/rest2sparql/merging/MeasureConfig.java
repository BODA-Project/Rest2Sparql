package de.uni_passau.fim.dimis.rest2sparql.merging;

/**
 * Configuration bean for matching 2 measures when merging cubes.
 */
public class MeasureConfig {

    private String measure;
    private String measureMatch;

    /**
     * @return the measure
     */
    public String getMeasure() {
        return measure;
    }

    /**
     * @param measure the measure to set
     */
    public void setMeasure(String measure) {
        this.measure = measure;
    }

    /**
     * @return the measureMatch
     */
    public String getMeasureMatch() {
        return measureMatch;
    }

    /**
     * @param measureMatch the measureMatch to set
     */
    public void setMeasureMatch(String measureMatch) {
        this.measureMatch = measureMatch;
    }
}
