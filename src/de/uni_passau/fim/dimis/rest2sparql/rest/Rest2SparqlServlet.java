package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.IRestAdapter;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.Methods;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.RestAdapter;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection;

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
    private static HashMap<String, ITripleStoreConnection.OutputFormat> formats = new HashMap<>();

    public static final int CODE_OK = 200;
    public static final int CODE_BAD_REQ = 400;

    static {
        formats.put("application/sparql-results+xml", ITripleStoreConnection.OutputFormat.XML);
        formats.put("application/sparql-results+json", ITripleStoreConnection.OutputFormat.JSON);
        formats.put("application/x-binary-rdf-results-table", ITripleStoreConnection.OutputFormat.BINARY);
        formats.put("text/tab-separated-values", ITripleStoreConnection.OutputFormat.TSV);
        formats.put("text/csv", ITripleStoreConnection.OutputFormat.CSV);
    }

    @Override
    public void init() throws ServletException {
        adapter = new RestAdapter();
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
                switch (m) {

                    case GET_CUBES:
                        res = adapter.execute(m);
                        break;
                    case GET_DIMENSIONS:
                    case GET_MEASURES:
                    case GET_ENTITIES:
                        res = adapter.execute(m, descriptor);
                        break;
                    case EXECUTE:
                        res = adapter.execute(m, descriptor);
                        break;
                }

                // set content, content type ans status code
                byte[] b = res.getBytes(Charset.forName("UTF-8"));
                //PrintWriter out = response.getWriter();
                //out.write(res);
                ServletOutputStream out = response.getOutputStream();
                out.write(b);
                out.flush();
                out.close();
                response.setContentType(type.mimeType);
                //response.addHeader("Content-Type", type.mimeType);
                response.setHeader("Content-Disposition", "attachment; filename=\"sparql\"");
                response.setCharacterEncoding("UTF-8");
                response.setStatus(CODE_OK);
            }
        }

    }
}
