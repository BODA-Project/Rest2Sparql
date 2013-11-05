package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/29/13
 * Time: 12:06 PM
 *
 * An {@link Exception} that may be thrown, if the passed method is not supported.
 */
public class MethodNotSupportedException extends RuntimeException {
    public MethodNotSupportedException(String msg) {
        super(msg);
    }
}
