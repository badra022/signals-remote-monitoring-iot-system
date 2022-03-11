/*
 * @Author: Ahmed Badra
 * @title: IOT application for remote vital signals monitoring
 * @mcu: ESP8266
 */

#include "DHT.h"
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>

/* DHT's connection options */ 
#define DHTPIN 0     // what digital pin the DHT11 is conected to
#define DHTTYPE DHT11   // setting the type as DHT11
DHT dht(DHTPIN, DHTTYPE);

/* server link */
const char *server_url = "http://mighty-headland-68010.herokuapp.com/";// Nodejs application endpoint

/***************************** PROTOTYPES DECLARATIONS ********************************/
void sendPOSTRequest(const char* server_url, const char* route, String urlencodedParams);
void sendGETRequest(const char* server_url, const char* route);


/***************************** objects used in the applications ***********************/
WiFiClient client;
HTTPClient http;

/*
 * @brief: function to be executed once at the beginning of the program
 * @description: function that handles these tasks
 *           01. setup the serial Monitor and the DHT sensor connection then wait 3 seconds 
 *           02. get a list of the available active connections, print them on the serial monitor
 *           03. input the SSID name of the Network you want to connect to
 *           04. input the SSID Password of the Network you want to connect to
 *           05. use the inputs (name, password) to connect to the Network
 *           06. loop over the connection state, wait 0.5 second for each check on the state
 */
void setup() {
  /* setup the serial Monitor and the DHT sensor connection then wait 3 seconds */
   Serial.begin(9600);
   dht.begin();
   delay(3000);

     /* get a list of the available active connections, print them on the serial monitor */
   uint8_t n = WiFi.scanNetworks();
   for(uint8_t i = 0; i < n; i++){
    Serial.print(i);
    Serial.print(". ");
    Serial.println(WiFi.SSID(i));
   }

   /* input the SSID name of the Network you want to connect to */
   Serial.print("enter the SSID name to connect with: ");
   while (Serial.available() == 0){ /* Wait for user input */ }  
   String ssid_name = Serial.readString();
   /* remove the \n in the end of the input */
   ssid_name[ssid_name.length() -1]  = '\0';
   Serial.println();   
   /* input the SSID Password of the Network you want to connect to */
   Serial.println("enter the password: ");
    while (Serial.available() == 0){ /* Wait for user input */ }
    String password = Serial.readString();
    /* remove \n in the end of the input */
    password[password.length() -1] = '\0';
    /* use the inputs (name, password) to connect to the Network */
   Serial.print(ssid_name + ",  " + password);
   WiFi.begin(ssid_name, password);
   /* poll over the connection successfully state of the WiFi module */
   while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
   }
   Serial.println("WiFi connected");
   delay(1000);
}

/* 
 *  @brief: function for periodic execution of the program
 *  @description: function that handles these tasks periodically
 *              01. read the temperature and humedity
 *              02. print them on the serial monitor
 *              03. send them to the server
 *              04. wait 0.5 second
 *              05. back to step 01
 */
void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();         
  Serial.print("Humidity = ");
  Serial.print(h);
  Serial.print("%  ");
  Serial.print("Temperature = ");
  Serial.print(t); 
  Serial.println("C  ");
  String urlencodedParams = "temp_value=" + String(t, 3) + "&hum_value=" + String(h, 3);
  sendPOSTRequest(server_url, "addreadings", urlencodedParams.c_str());
  delay(500);
}


/* 
 *  function for sending POST request with some parameters
 */
void sendPOSTRequest(const char* server_url, const char* route, String urlencodedParams)
{
    String service_url = String(server_url) + String(route);
    http.begin(client, service_url);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    int httpCode = http.POST(urlencodedParams);
    if(httpCode > 0){
      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = http.getString();
          Serial.print("Response: ");Serial.println(payload);
        }
    }else{
         Serial.printf("[HTTP] GET... failed, error: ");
         Serial.println(http.errorToString(httpCode).c_str());
    }
    http.end(); 
}

/* 
 *  function for sending GET request with some parameters
 */
void sendGETRequest(const char* server_url, const char* route)
{
    String service_url = String(server_url) + String(route);
    http.begin(client, service_url);
    int httpCode = http.GET();
    if(httpCode > 0){
      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = http.getString();
          Serial.print("Response: ");Serial.println(payload);
        }
    }else{
         Serial.printf("[HTTP] GET... failed, error: ");
         Serial.println(http.errorToString(httpCode).c_str());
    }
    http.end(); 
}
