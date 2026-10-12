@echo off
rem 사이트를 http://localhost:8795 로 띄우고 브라우저를 연다 (내 위치 찾기는 이렇게 열어야 동작)
rem 이 창을 닫으면 사이트도 꺼진다.
cd /d "%~dp0"
start "" http://localhost:8795/
python -m http.server 8795 --bind 127.0.0.1
