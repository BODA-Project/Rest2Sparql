package de.uni_passau.fim.dimis;

import de.uni_passau.fim.dimis.rest2sparql.rest.Rest2SparqlServer;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.RestAdapter;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {

        Rest2SparqlServer server = new Rest2SparqlServer(new RestAdapter(), 8080);
        server.startServer();
    }
}
