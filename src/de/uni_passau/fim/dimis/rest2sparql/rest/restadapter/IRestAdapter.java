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
     * Executes the method passed by the method argument.<p />
     * This method may, may not or may partly check if the method is valid an really takes no parameters.
     * You are advised to validate that by using the {@link #validateMethodParams(Methods, java.util.List) validateMethodParams} method.<p />
     * The behaviour of this method, supplied with invalid arguments, is unspecified!
     *
     * @param method The method to execute.
     * @return The result returned by the SPARQL backend.
     */
    String execute(Methods method);

    /**
     * Executes the method passed by the method argument and passes the {@List} of parameters.<p />
     * This method may, may not or may partly check if the method and its parameters are valid .
     * You are advised to validate that by using the {@link #validateMethodParams(Methods, java.util.List) validateMethodParams} method.<p />
     * The behaviour of this method, supplied with invalid arguments, is unspecified!
     *
     * @param method The method to execute.
     * @param params A {@List} of parameters.
     * @return The result returned by the SPARQL backend.
     */
    String execute(Methods method, List<CubeObject> params);

    /**
     * Validates if the {@List} of parameters matches the expected parameters of a given method.
     *
     * @param method The method to check the parameters against.
     * @param params The {@List} of {@CubeObject}s representing the parameters.
     * @return A {@String} that explains what is wrong with the parameters.<p />
     *         Returns an empty {@String} (""), if the {@List} of parameters match the one expected by the method.
     */
    String validateMethodParams(Methods method, List<CubeObject> params);

    /**
     * Returns a {@Set} of {@Methods} implemented by the adapter.
     *
     * @return a {@Set} of {@Methods} implemented by the adapter.
     */
    Set<Methods> getMethods();

}
