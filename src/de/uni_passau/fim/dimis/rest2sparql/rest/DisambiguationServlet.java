package de.uni_passau.fim.dimis.rest2sparql.rest;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

/**
 * Servlet for disambiguation of given entity labels.
 */
public class DisambiguationServlet extends HttpServlet {

    private final static String REQUEST_PREFIX = "{\"documentUri\": null, \"surfaceFormsToDisambiguate\": [{\"selectedText\":\"";
    private final static String REQUEST_SUFFIX = "\", \"context\":\"\",\"position\": []}]}";
    private final static String DISAMBIGUATION_SERVER = "http://zaire.dimis.fim.uni-passau.de:8181/code-server/disambiguation/disambiguate"; // TODO config file / init params

    private final static String PARAMETER_ENTITY = "entity";

    public static final int CODE_OK = 200;
    public static final int CODE_BAD_REQ = 400;
    public static final int CODE_UNAUTHED = 401;

    /**
     *
     * @param servletConfig
     * @throws ServletException
     */
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {

        /*
         TODO:

         read init-parameters (disambiguation server)
         init authorization...
         */
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
     * Handle the request and send the list as response back to the web application.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void handleRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String entity = request.getParameter(PARAMETER_ENTITY);
        String result = getDisambiguation(entity);

        // TODO: create JSON list of available resources

        // TEST:

        ServletOutputStream out = response.getOutputStream();
        out.println("1: " + entity);
        out.println("\n");
        out.println("2: " + REQUEST_PREFIX + entity + REQUEST_SUFFIX);
        out.println("\n");
        out.println("3: " + result);
        out.flush();
        out.close();
    }

    /**
     *
     * @param label
     * @return
     * @throws IOException
     */
    public String getDisambiguation(String label) throws IOException {

        //{
        //    "documentUri": null,
        //    "surfaceFormsToDisambiguate": [
        //        {
        //            "selectedText": "influenza",
        //            "context": "",
        //            "position": []
        //        }
        //    ]
        //}
        String body = REQUEST_PREFIX + label + REQUEST_SUFFIX;

        HttpClient client = HttpClients.createDefault();
        HttpPost post = new HttpPost(DISAMBIGUATION_SERVER);
        post.setHeader("accept", "application/json");
        post.setHeader("content-type", "application/json");
        StringEntity stringEntity = null;

        try {
            stringEntity = new StringEntity(body);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        post.setEntity(stringEntity);
        HttpResponse response = null;

        try {
            response = client.execute(post);
        } catch (IOException e) {
            e.printStackTrace();
        }

        HttpEntity entity = response.getEntity();

        String result = "";
        try {
            result = IOUtils.toString(entity.getContent(), "UTF-8");
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            EntityUtils.consume(entity);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

}
