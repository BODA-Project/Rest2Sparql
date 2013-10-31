package de.uni_passau.fim.dimis.rest2sparql.triplestore;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;

import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 11:07 AM
 * To change this template use File | Settings | File Templates.
 */
public interface ITripleStoreConnection {

    public enum OutputFormat{XML ("application/sparql-results+xml"),
                             JSON ("application/sparql-results+json"),
                             BINARY ("application/x-binary-rdf-results-table"),
                             TSV ("text/tab-separated-values"),
                             CSV ("text/csv");
        public final String mimeType;
        OutputFormat(String mimeType){
            this.mimeType = mimeType;
        }
    }

    String executeSPARQL(String query, OutputFormat format) throws ConnectionException;

}
