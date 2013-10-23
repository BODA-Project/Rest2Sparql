package de.uni_passau.fim.dimis.rest2sparql.triplestore.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 4:31 PM
 * To change this template use File | Settings | File Templates.
 */
public class QueryException extends RuntimeException {

    public QueryException(String msg) {
        super(msg);
    }

    public QueryException() {
    }

}

