package de.uni_passau.fim.dimis.rest2sparql.merging.dto;

import java.util.List;

/**
 * Wrapper class to contain all DTOs that describe a cube
 */
public class Cube {

    private Dataset dataset;
    private DatasetStructureDefinition dsd;
    private List<Dimension> dimensions;
    private List<Measure> measures;
    private List<Entity> entities;
    private List<Observation> observations;

    /**
     * @return the dataset
     */
    public Dataset getDataset() {
        return dataset;
    }

    /**
     * @param dataset the dataset to set
     */
    public void setDataset(Dataset dataset) {
        this.dataset = dataset;
    }

    /**
     * @return the dsd
     */
    public DatasetStructureDefinition getDsd() {
        return dsd;
    }

    /**
     * @param dsd the dsd to set
     */
    public void setDsd(DatasetStructureDefinition dsd) {
        this.dsd = dsd;
    }

    /**
     * @return the dimensions
     */
    public List<Dimension> getDimensions() {
        return dimensions;
    }

    /**
     * @param dimensions the dimensions to set
     */
    public void setDimensions(List<Dimension> dimensions) {
        this.dimensions = dimensions;
    }

    /**
     * @return the measures
     */
    public List<Measure> getMeasures() {
        return measures;
    }

    /**
     * @param measures the measures to set
     */
    public void setMeasures(List<Measure> measures) {
        this.measures = measures;
    }

    /**
     * @return the entities
     */
    public List<Entity> getEntities() {
        return entities;
    }

    /**
     * @param entities the entities to set
     */
    public void setEntities(List<Entity> entities) {
        this.entities = entities;
    }

    /**
     * @return the observations
     */
    public List<Observation> getObservations() {
        return observations;
    }

    /**
     * @param observations the observations to set
     */
    public void setObservations(List<Observation> observations) {
        this.observations = observations;
    }

}
