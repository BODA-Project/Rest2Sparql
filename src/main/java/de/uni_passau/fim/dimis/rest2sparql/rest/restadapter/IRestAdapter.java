package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;

import java.util.List;
import java.util.Set;

import static de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection.OutputFormat;

/**
 * The {@link IRestAdapter} defines all functions that have to be implemented by a class that works as an adapter between the REST Api and the REST2SPARQL layer.
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
     * Executes the method passed by the method argument and passes the {@link List} of parameters.<p />
     * This method may, may not or may partly check if the method and its parameters are valid .
     * You are advised to validate that by using the {@link #validateMethodParams(Methods, java.util.List) validateMethodParams} method.<p />
     * The behaviour of this method, supplied with invalid arguments, is unspecified!
     *
     * @param method The method to execute.
     * @param params A {@link List} of parameters.
     * @return The result returned by the SPARQL backend.
     */
    String execute(Methods method, List<CubeObject> params);

    /**
     * Executes the method passed by the method argument and passes the {@link QueryDescriptor}.<p />
     * This method may, may not or may partly check if the method and its parameters are valid.
     * You are advised to validate that by using the {@link #validateMethodParams(Methods, QueryDescriptor) validateMethodParams} method.<p />
     * The behaviour of this method, supplied with invalid arguments, is unspecified!
     *
     * @param method The method to execute.
     * @param params A {@link QueryDescriptor}.
     * @return The result returned by the SPARQL backend.
     */
    String execute(Methods method, QueryDescriptor params);

    /**
     * Validates if the {@link List} of parameters matches the expected parameters of a given method.
     *
     * @param method The method to check the parameters against.
     * @param params The {@link List} of {@link CubeObject}s representing the parameters.
     * @return A {@link String} that explains what is wrong with the parameters.<p />
     *         Returns an empty {@link String} (""), if the {@link List} of parameters match the one expected by the method.
     */
    String validateMethodParams(Methods method, List<CubeObject> params);

    /**
     * Validates if the {@link QueryDescriptor} matches the expected parameters of a given method.
     *
     * @param method The method to check the parameters against.
     * @param params The {@link QueryDescriptor} representing the parameters.
     * @return A {@link String} that explains what is wrong with the parameters.<p />
     *         Returns an empty {@link String} (""), if the {@link QueryDescriptor} match the one expected by the method.
     */
    String validateMethodParams(Methods method, QueryDescriptor params);

    /**
     * Returns a {@link Set} of {@link Methods} implemented by the adapter.
     *
     * @return a {@link Set} of {@link Methods} implemented by the adapter.
     */
    Set<Methods> getMethods();

    /**
     * Set the preferred {@link OutputFormat} for the returned data.<p />
     * The default should be {@link OutputFormat#XML}
     *
     * @param format The preferred {@link OutputFormat}.
     */
    void setOutputFormat(OutputFormat format);
}
