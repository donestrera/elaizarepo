#define SOIL_MOISTURE_PIN A1 // Connect sensor to A0
#define AIR_VALUE 620        // Value in air (dry)
#define WATER_VALUE 310      // Value in water (wet)

void setup()
{
  Serial.begin(9600);
}

void loop()
{
  int soilMoisture = analogRead(SOIL_MOISTURE_PIN);

  // Convert to percentage (0-100%)
  int moisturePercent = map(soilMoisture, AIR_VALUE, WATER_VALUE, 0, 100);

  // Constrain to valid range
  moisturePercent = constrain(moisturePercent, 0, 100);

  // Only send if value changes
  static int lastValue = -1;
  if (moisturePercent != lastValue)
  {
    Serial.println(moisturePercent);
    lastValue = moisturePercent;
  }

  delay(1000); // Read every second
}