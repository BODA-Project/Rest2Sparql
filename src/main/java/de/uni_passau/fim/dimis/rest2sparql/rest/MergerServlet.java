package de.uni_passau.fim.dimis.rest2sparql.rest;

import com.google.gson.Gson;
import de.uni_passau.fim.dimis.rest2sparql.merging.MergeService;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.MergeConfig;
import static de.uni_passau.fim.dimis.rest2sparql.rest.Rest2SparqlServlet.CODE_BAD_REQ;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for storage of a new merged cube.
 */
public class MergerServlet extends HttpServlet {

    public static final int CODE_OK = 200;
    public static final int CODE_BAD_REQ = 400;
    public static final int CODE_UNAUTHED = 401;
    public static final int CODE_ERROR = 500;
    public static final String MSG_UNAUTHED = "To access this resource, you have to provide an ID and a hash.\n"
            + "You can get your ID an the hash by using the getHash function and providing your mendeley username and password.\n\n"
            + "If you see this message but provided an ID and a hash one of it (or both) may be incorrect.";

    /**
     *
     * @param servletConfig
     * @throws ServletException
     */
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        // TODO: init authorization?
        super.init();
    }

    /**
     * Forward the post request.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        handleRequest(request, response);

    }

    /**
     * Forward the get request.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        handleRequest(request, response);
    }

    /**
     * Handle the request and send the response back to the web application
     * after finishing merging.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void handleRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // Load central configuration from json
        Gson gson = new Gson();
        MergeConfig config = gson.fromJson(request.getParameter("config"), MergeConfig.class);

        // Merge and store the datasets
        MergeService ms = new MergeService();
        String responseText;
        try {
            ms.merge(config);
            response.setStatus(CODE_OK);
            responseText = null;
        } catch (ConnectionException ex) {
            response.setStatus(CODE_ERROR);
            responseText = "Connection to database failed";
        }
        // TODO catch other merging exception for faulty config

        // Write a response
        try (PrintWriter out = response.getWriter()) {
            out.write(responseText);
        }
        response.setContentType("text/plain");
        response.flushBuffer();
    }

}
