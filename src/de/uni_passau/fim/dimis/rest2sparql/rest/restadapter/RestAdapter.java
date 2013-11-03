package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

import de.uni_passau.fim.dimis.rest2sparql.cubemanagement.CubeManager;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.CodeBigdataEngine;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import de.uni_passau.fim.dimis.rest2sparql.util.Cube;
import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;
import de.uni_passau.fim.dimis.rest2sparql.util.Dimension;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.Methods.*;
import static de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection.OutputFormat;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/29/13
 * Time: 12:17 PM
 * <p/>
 * This class implements {@IRestAdapter} and thus provides adapter functionality between the provided rest api and the backend.
 */
public class RestAdapter implements IRestAdapter {

    private Set<Methods> implementedMethods = new HashSet<>(5);
    private CubeManager manager;
    private ITripleStoreConnection connection;
    private OutputFormat preferredFormat;

    public RestAdapter() {

        init();

        connection = new CodeBigdataEngine();
        manager = new CubeManager(connection);
    }

    public RestAdapter(ITripleStoreConnection connection) {

        init();

        this.connection = connection;
        manager = new CubeManager(connection);
    }

    private void init() {
        implementedMethods.add(EXECUTE);
        implementedMethods.add(GET_CUBES);
        implementedMethods.add(GET_DIMENSIONS);
        implementedMethods.add(GET_ENTITIES);
        implementedMethods.add(GET_MEASURES);
    }

    /**
     * @inheritDoc
     */
    @Override
    public String execute(Methods method) {

        String result;

        switch (method) {
            case GET_CUBES:
                try {
                    result = manager.getCubes();
                } catch (ConnectionException e) {
                    result = buildBackendExceptionMsg(e);
                }
                break;
            case GET_MEASURES:
            case GET_ENTITIES:
            case GET_DIMENSIONS:
            case EXECUTE:
                throw new UnknownMethodException("There is no method registrated with this name, that does not take any parameters!");
            default:
                throw new MethodNotSupportedException("This method is not known or supported by this adapter.");
        }

        return result;
    }

    /**
     * @inheritDoc
     */
    @Override
    public String execute(Methods method, List<CubeObject> params) {

        String result;

        try {
            result = exec(method, params);
        } catch (ConnectionException e) {
            result = buildBackendExceptionMsg(e);
        }

        return result;
    }

    /**
     * @inheritDoc
     */
    @Override
    public String validateMethodParams(Methods method, List<CubeObject> params) {

        String msg = "";

        switch (method) {

            case GET_CUBES:
                if (params.size() > 0) {
                    msg = "This method does not take any parameters.";
                }
                break;

            case GET_DIMENSIONS:
            case GET_MEASURES:
                if (params.size() != 1) {
                    msg = "This method takes exactly one parameter.";
                } else {
                    if (!params.get(0).getClass().equals(Cube.class)) {
                        msg = "The parameter has to be of the type 'cube'.";
                    }
                }
                break;

            case GET_ENTITIES:
                if (params.size() != 2) {
                    msg = "This method takes exactly two parameters.";
                } else {
                    if (!(params.get(0) instanceof Cube && params.get(1) instanceof Dimension ||
                            params.get(1) instanceof Cube && params.get(0) instanceof Dimension)) {
                        msg = "The parameters have to be of the type 'cube' and 'dimension'.";
                    }
                }
                break;

            case EXECUTE:
                // execute may take everything except no parameters
                if (params.size() == 0) {
                    msg = "There were no parameters found. This function takes any number (> 0) and type of parameters.";
                }
                break;

            default:
                throw new MethodNotSupportedException("This method is not supported by this adapter.");
        }

        return msg;
    }

    /**
     * @inheritDoc
     */
    @Override
    public Set<Methods> getMethods() {
        return Collections.unmodifiableSet(implementedMethods);
    }

    /**
     * @inheritDoc
     */
    @Override
    public void setOutputFormat(OutputFormat format) {
        manager.setOutputFormat(format);
        this.preferredFormat = format;
    }

    private String buildBackendExceptionMsg(ConnectionException e) {

        StringBuilder result = new StringBuilder("A problem occurred while connecting to the SPARQL Backend.\n" +
                "It was caused by the following Exception:\n");
        result.append(e.getMessage());
        result.append('\n');
        for (StackTraceElement el : e.getCause().getStackTrace()) {
            result.append(el.toString());
            result.append('\n');
        }

        return result.toString();
    }

    private String exec(Methods method, List<CubeObject> params) throws ConnectionException {
        String result;

        switch (method) {
            case GET_CUBES:
                throw new UnknownMethodException("This method does not take any parameters.");

            case GET_MEASURES:
                if (params.size() < 1 || !(params.get(0) instanceof Cube)) {
                    throw new IllegalArgumentException();
                }
                result = manager.getMeasures((Cube) params.get(0));
                break;

            case GET_ENTITIES:
                Cube c;
                Dimension d;
                if (params.size() == 2 && params.get(0) instanceof Cube && params.get(1) instanceof Dimension) {
                    c = (Cube) params.get(0);
                    d = (Dimension) params.get(1);
                } else if (params.size() == 2 && params.get(1) instanceof Cube && params.get(0) instanceof Dimension) {
                    c = (Cube) params.get(1);
                    d = (Dimension) params.get(0);
                } else {
                    throw new IllegalArgumentException();
                }
                result = manager.getEntities(d, c);
                break;

            case GET_DIMENSIONS:
                if (params.size() < 1 || !(params.get(0) instanceof Cube)) {
                    throw new IllegalArgumentException();
                }
                result = manager.getDimensions((Cube) params.get(0));
                break;

            case EXECUTE:
                if (params.size() < 1) {
                    throw new IllegalArgumentException();
                }
                result = ""; // TODO implement
                break;

            default:
                throw new MethodNotSupportedException("This method is not supported by this adapter.");
        }

        return result;
    }
}
