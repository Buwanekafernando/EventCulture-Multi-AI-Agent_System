@echo off
echo Testing EventCulture Event Collector with cURL
echo ================================================

echo.
echo 1. Testing server health...
curl -X GET http://localhost:8000/

echo.
echo.
echo 2. Collecting events from all sources...
curl -X POST http://localhost:8000/api/collector/collect-events/ -H "Content-Type: application/json"

echo.
echo.
echo 3. Listing all collected events...
curl -X GET http://localhost:8000/api/collector/events/

echo.
echo.
echo Testing completed!
pause

