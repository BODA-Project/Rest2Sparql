package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;

import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/29/13
 * Time: 11:56 AM
 * <p/>
 * The {@IRestAdapter} defines all functions that have to be implemented by a class that works as an adapter between the REST Api and the REST2SPARQL layer.
 */
public interface IRestAdapter {

    /**
     * Execute the method passed by the method parameter.
     *
     * @param method The method to execute.
     * @return The result returned by the SPARQL backend.
     * @throws MethodNotSupportedException If the method is not supported.
     * @throws UnknownMethodException      If the method is not known by the system.
     */
    String execute(Methods method) throws MethodNotSupportedException, UnknownMethodException;

    /**
     * Execute the method indicated by the 'func' parameter in the params argument.
     *
     * @param method The method to execute.
     * @param params A {@List} of parameters.
     * @return The result returned by the SPARQL backend.
     * @throws MethodNotSupportedException If the method is not supported.
     * @throws UnknownMethodException      If the method is not known by the system.
     */
    String execute(Methods method, List<CubeObject> params) throws MethodNotSupportedException, UnknownMethodException;

    /**
     * Returns a {@Set} of {@Methods} implemented by the adapter.
     *
     * @return a {@Set} of {@Methods} implemented by the adapter.
     */
    Set<Methods> getMethods();

}
