package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/29/13
 * Time: 12:04 PM
 *
 * An {@link Exception} to throw, if the method executed is not known.
 */
public class UnknownMethodException extends RuntimeException {

    public UnknownMethodException(String msg) {
        super(msg);
    }

}
