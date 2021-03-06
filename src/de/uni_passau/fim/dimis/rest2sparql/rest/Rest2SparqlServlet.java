package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.auth.AuthEngine;
import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.IRestAdapter;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.Methods;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.RestAdapter;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.CodeBigdataEngine;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.CodeMarmottaEngine;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.CodeVirtuosoEngine;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;

/**
 *
 */
public class Rest2SparqlServlet extends HttpServlet {

    private static IRestAdapter adapter;
    private static AuthEngine authEngine;
    private static HashMap<String, ITripleStoreConnection.OutputFormat> formats = new HashMap<>();

    public static final int CODE_OK = 200;
    public static final int CODE_BAD_REQ = 400;
    public static final int CODE_UNAUTHED = 401;

    public static final String MSG_UNAUTHED = "To access this resource, you have to provide an ID and a hash.\n" +
            "You can get your ID an the hash by using the getHash function and providing your mendeley username and password.\n\n" +
            "If you see this message but provided an ID and a hash one of it (or both) may be incorrect.";
    public static final byte[] MSG_UNAUTHED_BYTES = MSG_UNAUTHED.getBytes(Charset.forName("UTF-8"));

    public static final String MSG_NO_ID_GET_HASH = "To get the auth token, you have to provide an ID!";
    public static final byte[] MSG_NO_ID_GET_HASH_BYTES = MSG_NO_ID_GET_HASH.getBytes(Charset.forName("UTF-8"));

    static {
        formats.put("application/sparql-results+xml", ITripleStoreConnection.OutputFormat.XML);
        formats.put("application/sparql-results+json", ITripleStoreConnection.OutputFormat.JSON);
        formats.put("application/x-binary-rdf-results-table", ITripleStoreConnection.OutputFormat.BINARY);
        formats.put("text/tab-separated-values", ITripleStoreConnection.OutputFormat.TSV);
        formats.put("text/csv", ITripleStoreConnection.OutputFormat.CSV);
    }

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {

        String host = servletConfig.getInitParameter("host");
        if (host == null) {
            throw new IllegalArgumentException("No host specified!");
        }

        int port = 8080;
        try {
            port = Integer.parseInt(servletConfig.getInitParameter("port"));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Non-numeric or no value in port config!");
        }

        ITripleStoreConnection con = null;
        switch (servletConfig.getInitParameter("engine")) {
            case "bigdata":
                con = new CodeBigdataEngine(host, port);
                break;
            case "marmotta":
                con = new CodeMarmottaEngine(host, port);
                break;
            case "virtuoso":
                con = new CodeVirtuosoEngine(host, port);
                break;
            default:
                throw new IllegalArgumentException("Unknown or no value in engine config!");
        }

        //adapter = new RestAdapter();
        adapter = new RestAdapter(con);
        authEngine = new AuthEngine("SomeVerySecretSalt123+!");
        super.init();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // ******************************
        // Output format handling
        // ******************************

        // default format is XML
        ITripleStoreConnection.OutputFormat type = ITripleStoreConnection.OutputFormat.XML;

        // retrieve accepted format
        String header = request.getHeader("accept");
        if (header != null && !header.equals("")) {
            for (String s : header.split(",")) {
                if (formats.containsKey(s)) {
                    type = formats.get(header);
                }
            }
        }

        // set format
        adapter.setOutputFormat(type);

        // ******************************
        // request execution
        // ******************************

        // get and trim uri
        String target = request.getQueryString();

        // Validate the String
        List<String> invalidParams = URLConverter.validate(target);

        // If the URL contains invalid parameters, notify the user
        if (!invalidParams.isEmpty()) {
            StringBuilder sb = new StringBuilder("The URL contains invalid parameters!\nHere is a list:\n");
            for (String s : invalidParams) {
                sb.append(s);
                sb.append('\n');
            }

            // set error message, content type and status
            PrintWriter out = response.getWriter();
            out.write(sb.toString());
            out.close();
            response.setContentType("text/plain");
            response.setStatus(CODE_BAD_REQ);

        }

        // If the request is valid, execute it and return the result
        else {

            String res = "";
            Methods m = URLConverter.getMethod(target);
            QueryDescriptor descriptor = URLConverter.getQueryDescriptor(target);

            if (m == Methods.GET_HASH) {

                // if no id is provided, return 400
                if (descriptor.getID() == null) {

                    // set content, content type ans status code
                    ServletOutputStream out = response.getOutputStream();
                    out.write(MSG_NO_ID_GET_HASH_BYTES);
                    out.flush();
                    out.close();
                    response.setContentType("text/plain");
                    response.setCharacterEncoding("UTF-8");
                    response.setStatus(CODE_BAD_REQ);

                } else {

                    res = authEngine.createHash(descriptor.getID());

                    // set content, content type ans status code
                    byte[] b = res.getBytes(Charset.forName("UTF-8"));
                    ServletOutputStream out = response.getOutputStream();
                    out.write(b);
                    out.flush();
                    out.close();
                    response.setContentType(type.mimeType);
                    response.setHeader("Content-Disposition", "attachment; filename=\"sparql\"");
                    response.setCharacterEncoding("UTF-8");
                    response.setStatus(CODE_OK);

                }

            } else {

                // check the id and hash
                boolean authorized = descriptor.getID() != null &&
                        descriptor.getHash() != null &&
                        authEngine.checkHash(descriptor.getID(), descriptor.getHash());

                // if the check failed, send auth-msg
                if (!authorized) {

                    // set content, content type ans status code
                    ServletOutputStream out = response.getOutputStream();
                    out.write(MSG_UNAUTHED_BYTES);
                    out.flush();
                    out.close();
                    response.setContentType("text/plain");
                    response.setCharacterEncoding("UTF-8");
                    response.setStatus(CODE_UNAUTHED);

                } else {

                    // check if request is valid
                    String validatorOutput = adapter.validateMethodParams(m, descriptor);

                    // if not valid
                    if (!validatorOutput.isEmpty()) {
                        // set error message, content type and status
                        PrintWriter out = response.getWriter();
                        out.write(validatorOutput);
                        out.close();
                        response.setContentType("text/plain");
                        response.setStatus(CODE_BAD_REQ);
                    }

                    // if valid, execute query
                    else {

//                        System.out.println(QueryFactory.buildObservationQuery(descriptor));
                        res = adapter.execute(m, descriptor);

                        // set content, content type ans status code
                        byte[] b = res.getBytes(Charset.forName("UTF-8"));
                        ServletOutputStream out = response.getOutputStream();
                        out.write(b);
                        out.flush();
                        out.close();
                        response.setContentType(type.mimeType);
                        response.setHeader("Content-Disposition", "attachment; filename=\"sparql\"");
                        response.setCharacterEncoding("UTF-8");
                        response.setStatus(CODE_OK);
                    }
                }
            }
        }
    }
}
