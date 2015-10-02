package de.uni_passau.fim.dimis.rest2sparql.triplestore;


abstract public class CodeEngine implements ITripleStoreConnection {

    protected String host = "localhost";
    protected int port = 8080;

    public CodeEngine(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public CodeEngine() {
    }
}
