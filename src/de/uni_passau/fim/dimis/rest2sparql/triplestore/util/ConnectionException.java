package de.uni_passau.fim.dimis.rest2sparql.triplestore.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 11:12 AM
 * To change this template use File | Settings | File Templates.
 */
public class ConnectionException extends Exception {
    public ConnectionException(String msg) {
        super(msg);
    }

    public ConnectionException(Exception cause) {
        super(cause);
    }
}
