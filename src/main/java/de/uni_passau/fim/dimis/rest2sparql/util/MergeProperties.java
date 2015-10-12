package de.uni_passau.fim.dimis.rest2sparql.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * A properties class for common merging configurations.
 */
public class MergeProperties {

    private static final String RESOURCE = "/application.properties";
    private static MergeProperties instance;
    private static Properties properties;

    /**
     * Singleton constructor
     */
    private MergeProperties() {
        properties = new Properties();
        InputStream in = getClass().getResourceAsStream(RESOURCE);
        try {
            properties.load(in);
            in.close();
        } catch (IOException ex) {
            Logger.getLogger(MergeProperties.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Gets the only instance of the properties.
     *
     * @return the instance of the Properties object
     */
    public synchronized static MergeProperties getInstance() {
        if (instance == null) {
            instance = new MergeProperties();
        }
        return instance;
    }

    /**
     *
     * @return
     */
    public String getTripleStore() {
        return properties.getProperty("tripleStore");
    }

    /**
     *
     * @return
     */
    public String getDisambiguationServer() {
        return properties.getProperty("disambiguationServer");
    }

    /**
     * @return
     */
    public String getObservationQuery() {
        return getClass().getResource("/queries/observations.sparql").getFile();
    }

    /**
     *
     * @return
     */
    public String getDimensionQuery() {
        return getClass().getResource("/queries/dimensions.sparql").getFile();
    }

    /**
     *
     * @return
     */
    public String getEntityQuery() {
        return getClass().getResource("/queries/entities.sparql").getFile();
    }

    /**
     *
     * @return
     */
    public String getMeasureQuery() {
        return getClass().getResource("/queries/measures.sparql").getFile();
    }

    /**
     *
     * @return
     */
    public String getDatasetQuery() {
        return getClass().getResource("/queries/dataset.sparql").getFile();
    }

    /**
     *
     * @return
     */
    public String getDSDQuery() {
        return getClass().getResource("/queries/dsd.sparql").getFile();
    }

}
