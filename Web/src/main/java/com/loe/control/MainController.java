
package com.loe.control;

import java.io.IOException;

import org.apache.http.ParseException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@Controller
public class MainController {
	@Value("${ldcc.startiot.url}")
	private String url;
	@Value("${ldcc.startiot.deviceid}")
	private String device_id;
	@Value("${ldcc.startiot.dkey}")
	private String dKey;
	@Autowired
	private SimpMessagingTemplate template;

	private static String paser(String body) throws Exception {
		JSONParser jsonParser = new JSONParser();
		JSONObject result = (JSONObject) jsonParser.parse(body);
		JSONObject sgn = (JSONObject) result.get("m2m:sgn");
		JSONObject nev = (JSONObject) sgn.get("nev");
		JSONObject rep = (JSONObject) nev.get("rep");
		JSONObject om = (JSONObject) nev.get("om");
		if (om.get("op").toString().equals("1")) {
			JSONObject cin = (JSONObject) rep.get("m2m:cin");
			return (String) cin.get("con");
		} else {
			return "error";
		}
	}

	private static String parser(String body) throws Exception {
		JSONParser jsonParser = new JSONParser();
		JSONObject result = (JSONObject) jsonParser.parse(body);
		JSONObject cin = (JSONObject) result.get("m2m:cin");
		
		return (String) cin.get("con");
		
	}
	@RequestMapping(value = "/dashboard", method = RequestMethod.POST)
	@ResponseStatus(value = HttpStatus.OK)
	public void dashboard(@RequestBody String body, @RequestHeader HttpHeaders headers) throws Exception {
		System.out.println(body);
		String content = paser(body);
		System.out.println("Dashboard in : " + content);
		if (content.equals("4")) {
			System.out.println("contentInstance is Deleted");
		} else {
			HttpEntity<String> entity = new HttpEntity<String>(content, headers);
			this.template.convertAndSend("/topic/subscribe", entity);
		}

	}

	/**
	 * 
	 * @param iotPlatformUrl
	 *            : iot플랫폼 주소
	 * @param device_id
	 *            : OID(디바이스아이디)
	 * @param cmdName
	 *            : 명령키 (ex..switch)
	 * @param cmd
	 *            : 명령값 (ex..0 or 1, ON or OFF, on or off ..etc)
	 * @param cmdName1
	 * @param cmd1
	 * @param dKey
	 *            : 디바이스인증키
	 * @throws ParseException
	 * @throws IOException
	 */
	public void sendMgmt(String iotPlatformUrl, String device_id, String cmdName, String cmd, String cmdName1,
			String cmd1, String dKey) throws ParseException, IOException {
		String resourceUrl = iotPlatformUrl + "/controller-" + device_id;
		System.out.println("iotPlatformResourceUrl : " + resourceUrl);
		System.out.println("OID : " + device_id);
		System.out.println("commandName : " + cmdName);
		System.out.println("command : " + cmd);
		CloseableHttpClient httpclient = HttpClients.createDefault();
		try {
			HttpPut httpPut = new HttpPut(resourceUrl);
			httpPut.setHeader("X-M2M-RI", "RQI0001"); //
			httpPut.setHeader("X-M2M-Origin", "/S" + device_id); //
			httpPut.setHeader("Accept", "application/json");
			httpPut.setHeader("Authorization", "Bearer " + dKey);
			httpPut.setHeader("Content-Type", "application/vnd.onem2m-res+json");
			String body = "{ \"m2m:mgc\": {\"cmt\": 4,\"exra\": { \"any\":[{\"nm\" :\"" + cmdName + "\", \"val\" : \""
					+ cmd + "\"} ]},\"exm\" : 1,\"exe\":true,\"pexinc\":false}}";
			System.out.println(body);
			httpPut.setEntity(new StringEntity(body));

			CloseableHttpResponse res = httpclient.execute(httpPut);

			try {
				if (res.getStatusLine().getStatusCode() == 200) {
					org.apache.http.HttpEntity entity = (org.apache.http.HttpEntity) res.getEntity();
					System.out.println(EntityUtils.toString(entity));
				} else {
					System.out.println("sendMgmt eerr");
				}
			} finally {
				res.close();
			}
		} finally {
			httpclient.close();
		}

	}

	/**
	 * 
	 * @param meesagePlatformUrl
	 *            : 메시지플랫폼url
	 * @param send_phone
	 *            : 카카오 메시지를 받을 핸드폰 번호
	 * @param sender_key
	 *            : API 발송 key d6b73318d4927aa80df1022e07fecf06c55b44bf
	 * @param authKey
	 *            : 인증키
	 * @param message
	 *            : 보낼 메시지
	 * @return
	 * @throws Exception
	 */
	public int sendMesageAPI(String meesagePlatformUrl, String send_phone, String authKey, String sender_key,
			String message) throws Exception {

		CloseableHttpClient httpclient = HttpClients.createDefault();
		try {
			HttpPost httpPost = new HttpPost(meesagePlatformUrl);
			// httpPost.setHeader("Authorization", "Basic
			// Y2xhc3M6bm90X29wZW5fYXBp");
			httpPost.setHeader("Authorization", "Basic " + authKey);
			httpPost.setHeader("Content-Type", "application/json; charset=EUC-KR");
			String body2 = "{ \"msg_id\" : \"iot\", \"dest_phone\" : \"" + send_phone + "\", \"send_phone\" : \""
					+ send_phone + "\", \"sender_key\" : \"" + sender_key + "\", \"msg_body\" : \"" + message
					+ "\", \"ad_flag\" : \"N\" }";

			ByteArrayEntity entity = new ByteArrayEntity(body2.getBytes("UTF-8"));

			System.out.println("TO Kakao BODY Message : " + body2);
			httpPost.setEntity(entity);

			CloseableHttpResponse res = httpclient.execute(httpPost);

			try {
				if (res.getStatusLine().getStatusCode() == 200) {
					org.apache.http.HttpEntity entity2 = (org.apache.http.HttpEntity) res.getEntity();
					System.out.println(EntityUtils.toString(entity2));
				} else {
					System.out.println("eerr");
				}
			} finally {
				res.close();
			}
		} finally {
			httpclient.close();
		}
		return 0;

	}

	/**
	 * 
	 * @param iotPlatformUrl
	 *            : iot플랫폼 주소
	 * @param device_id
	 *            : OID(디바이스아이디)
	 * @param cmdName1
	 * @param cmd1
	 * @param dKey
	 *            : 디바이스인증키
	 * @throws ParseException
	 * @throws IOException
	 */
	public String ReadinitDatas(String iotPlatformUrl, String device_id, String dKey) throws ParseException, IOException {
		String resourceUrl = iotPlatformUrl + "/S" + device_id + "/temperature/la";
		System.out.println("iotPlatformResourceUrl : " + resourceUrl);
		System.out.println("OID : " + device_id);
		CloseableHttpClient httpclient = HttpClients.createDefault();
		try {
			HttpGet httpGet = new HttpGet(resourceUrl);
			httpGet.setHeader("X-M2M-RI", "RQI0001"); //
			httpGet.setHeader("X-M2M-Origin", "/S" + device_id); //
			httpGet.setHeader("Accept", "application/json");
			httpGet.setHeader("Authorization", "Bearer " + dKey);

			CloseableHttpResponse res = httpclient.execute(httpGet);
			try {
				if (res.getStatusLine().getStatusCode() == 200) {
					org.apache.http.HttpEntity entity = (org.apache.http.HttpEntity) res.getEntity();
					String reasonPhrase = EntityUtils.toString(entity);
					System.out.println("CSE Instance Json : " + reasonPhrase);
					
					try {
						String init_tem_value = parser(reasonPhrase);
						return init_tem_value;
					} catch (Exception e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					
				} else {
					System.out.println("Read Init Datas eerr");
				}
			} finally {
				res.close();
			}
		} finally {
			httpclient.close();
		}
		return "Init temperature data Error"; 
	}
	@RequestMapping(value = "/sendtoplug", method = RequestMethod.POST)
	@ResponseStatus(value = HttpStatus.OK)
	public void sendToplug(@RequestBody String body, @RequestHeader HttpHeaders headers) throws Exception {
		System.out.println("in sendtoplug");
		System.out.println(body);
		if (body.equals("ON")) {
			sendMgmt(url, device_id, "switch", "1", "switch1", "null", dKey);
		} else {
			sendMgmt(url, device_id, "switch", "0", "switch1", "null", dKey);
		}

	}
	
	// 온도 데이터 초기 값 얻어오
	@RequestMapping(value = "/initialize", method = RequestMethod.POST, produces = "text/plain")
	@ResponseStatus(value = HttpStatus.OK)
	@ResponseBody
	public String ReadInitData(@RequestBody String body, @RequestHeader HttpHeaders headers) throws Exception {
		System.out.println("Init temperature Datas");
		System.out.println("Init operate method : " + body);
		String init_temp_value = ReadinitDatas(url, device_id, dKey);
		System.out.println("Get init Temperature Data : " + init_temp_value);
		return init_temp_value;
	}
}
