package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.Methods;
import de.uni_passau.fim.dimis.rest2sparql.util.*;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;

import java.nio.charset.Charset;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/31/13
 * Time: 12:57 PM
 * To change this template use File | Settings | File Templates.
 */
public final class URLConverter {

    private static final String FUNCTION_STR = "func";
    private static Map<String, Methods> strToMethMap = new HashMap<>();
    private static Set<String> validParams = new HashSet<>();

    static {
        strToMethMap.put("getCubes", Methods.GET_CUBES);
        strToMethMap.put("getDimensions", Methods.GET_DIMENSIONS);
        strToMethMap.put("getMeasures", Methods.GET_MEASURES);
        strToMethMap.put("getEntities", Methods.GET_ENTITIES);
        strToMethMap.put("execute", Methods.EXECUTE);

        validParams.add("func");
        validParams.add("c");
        validParams.add("d");
        validParams.add("m");
    }

    /**
     * Parses the given url and extracts the function parameter.
     *
     * @param url The url to parse.
     * @return The {@Methods} that is indicated by the function parameter in the url.
     */
    public static Methods getMethod(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());

        for (NameValuePair p : l) {
            if (p.getName().equals(FUNCTION_STR)) {

                String func = p.getValue();

                if (strToMethMap.containsKey(func)) {
                    return strToMethMap.get(func);
                } else {
                    throw new IllegalArgumentException("\'" + func + "\' is not a vaild function!");
                }
            }
        }

        throw new IllegalArgumentException("No parameter found that indicates a function!");

    }

    /**
     * Parses the given url and returns a {@List} of {@CubeObject}s generated from the parameters.
     *
     * @param url The url to parse.
     * @return A {@List} of {@CubeObject}s generated from the parameters.
     */
    public static List<CubeObject> getParameters(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());
        List<CubeObject> params = new ArrayList<>(l.size());

        for (NameValuePair p : l) {

            switch (p.getName()) {
                case "c":
                    params.add(new Cube(p.getValue()));
                    break;
                case "d":
                    params.add(parseDimension(p.getValue()));
                    break;
                case "m":
                    params.add(new Measure(p.getValue()));
                    break;
                case "func":
                    // Nothing to do
                    break;
                default:
                    throw new IllegalArgumentException("There are invalid parameters in the url! Use the validate method first!");
            }

        }

        return params;
    }

    /**
     * Validates an url and returns a {@List} of {@String}s with the parameters in the url that are not vaild.
     * Returns an empty {@List}, if the url is valid.
     *
     * @param url The url to validate.
     * @return A {@List} of {@String}s with the invalid parameters or an empty {@List} if all parameters are valid.
     */
    public static List<String> validate(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());
        List<String> invalidParams = new ArrayList<>(l.size());
        boolean foundFunc = false;
        boolean multipleFuncs = false;

        for (NameValuePair p : l) {

            // check if valid parameter
            if (!validParams.contains(p.getName())) {

                // if not, add to list
                invalidParams.add("Invaid parameter: \'" + p.getName() + "\'");

            } else {

                // if valid, check if function
                if (p.getName().equals(FUNCTION_STR)) {

                    // if function and no function parameter found before, set flag
                    if (!foundFunc) {
                        foundFunc = true;

                    // if function but there was one before, set flag
                    } else {
                        multipleFuncs = true;
                    }

                    // check if the function is valid
                    if (!strToMethMap.containsKey(p.getValue())) {
                        invalidParams.add("Unknown Function: \'" + p.getValue() + "\'");
                    }
                }
            }
        }

        if (!foundFunc) {
            invalidParams.add("No parameter found that indicates which function to use!");
        }

        if (multipleFuncs) {
            invalidParams.add("There were multiple parameters found that indicate which function to use!");
        }

        return invalidParams;
    }

    /**
     * Decides if a {@Dimension} or {@FixedDimension} is needed, creates the object and returns it.
     *
     * @param s The part of the url to parse.
     * @return A {@Dimension} or {@FixedDimension}.
     */
    private static Dimension parseDimension(String s) {

        Dimension retVal;

        if (s.contains("=")) {
            retVal = new FixedDimension(s.split("=")[0], s.split("=")[1]);
        } else {
            retVal = new Dimension(s);
        }

        return retVal;
    }
}
