package de.uni_passau.fim.dimis.rest2sparql.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 */
public class MergeProperties {

    private static final String RESOURCE = "/application.properties";
    private static MergeProperties instance;
    private static Properties properties;

    /**
     *
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
     *
     * @return
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
    public String getComponentQuery() {
        return getClass().getResource("/queries/components.sparql").getFile();
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

    // TODO more queries: DSD, Importer, Import, Dataset, ...
}
