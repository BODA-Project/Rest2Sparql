package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

import de.uni_passau.fim.dimis.rest2sparql.cubemanagement.CubeManager;
import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryFactory;
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
 * This class implements {@link IRestAdapter} and thus provides adapter functionality between the provided rest api and the backend.
 */
public class RestAdapter implements IRestAdapter {

    private final Set<Methods> implementedMethods = new HashSet<>(5);
    private final CubeManager manager;
    private final ITripleStoreConnection connection;
    private OutputFormat preferredFormat;

    public RestAdapter() {

        init();

        connection = new CodeBigdataEngine();
        manager = new CubeManager(connection);
    }

    @SuppressWarnings("unused")
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
    public String execute(Methods method, QueryDescriptor params) {

        String result;

        // Check for ID to avoid an NullPointerException later on
        if (params.getID() == null) {
            throw new IllegalArgumentException("The parameters have to include an ID that is not null!");
        }

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
                // there has to be at least one parameter
                if (params.size() == 0) {
                    msg = "There were no parameters found. This function takes any number (> 0) and type of parameters.";
                }

                // there has to be exactly one cube in the list
                else {
                    boolean foundOnce = false;
                    for (CubeObject c : params) {

                        if (c instanceof Cube) {

                            // if first cube found, set flag
                            if (!foundOnce) {
                                foundOnce = true;
                            }

                            // if second cube found, reset flag and exit for loop
                            else {
                                foundOnce = false;
                                break;
                            }
                        }
                    }

                    // if flag is not set, write msg
                    if (!foundOnce) {
                        msg = "There has to be exactly one 'cube' parameter.";
                    }
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
    public String validateMethodParams(Methods method, QueryDescriptor params) {
        String msg = "";

        switch (method) {

            case GET_CUBES:
                if (params.size() > 0) {
                    msg = "This method does not take any parameters.";
                }
                break;

            case GET_DIMENSIONS:
            case GET_MEASURES:
                if (params.size() != 1 || params.nofCubes() != 1) {
                    msg = "This method takes exactly one parameter of the type 'cube'.";
                }
                break;

            case GET_ENTITIES:
                if (params.size() != 2 || params.nofCubes() != 1 || params.nofDimensions() != 1) {
                    msg = "This method takes exactly two parameters of the types 'cube' and 'dimension'.";
                }
                break;

            case EXECUTE:
                if (params.size() == 0 || params.nofCubes() != 1) {
                    msg = "There has to be exactly one 'cube' parameter.";
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
                result = connection.executeSPARQL(QueryFactory.buildObservationQuery(params), preferredFormat);
                break;

            default:
                throw new MethodNotSupportedException("This method is not supported by this adapter.");
        }

        return result;
    }

    private String exec(Methods method, QueryDescriptor params) throws ConnectionException {
        String result;

        switch (method) {
            case GET_CUBES:
                result = manager.getCubes(params.getID());
                // No illegal argument appropriate any more, because in the params is the id
                // throw new UnknownMethodException("This method does not take any parameters.");
                break;

            case GET_MEASURES:
                if (params.nofCubes() < 1) {
                    throw new IllegalArgumentException();
                }
                result = manager.getMeasures(params.getCubes().get(0), params.getID());
                break;

            case GET_ENTITIES:
                if (params.nofCubes() < 1 || params.nofDimensions() < 1) {
                    throw new IllegalArgumentException();
                }
                result = manager.getEntities(params.getDimensions().get(0), params.getCubes().get(0), params.getID());
                break;

            case GET_DIMENSIONS:
                if (params.nofCubes() < 1) {
                    throw new IllegalArgumentException();
                }
                result = manager.getDimensions(params.getCubes().get(0), params.getID());
                break;

            case EXECUTE:
                result = connection.executeSPARQL(QueryFactory.buildObservationQuery(params), preferredFormat);
                break;

            default:
                throw new MethodNotSupportedException("This method is not supported by this adapter.");
        }

        return result;
    }
}
