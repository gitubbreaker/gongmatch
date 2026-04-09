import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://gongmatch-production.up.railway.app/api/students/login'
data = json.dumps({"loginId":"suhyun@test.com","password":"1234"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        res = json.loads(f.read().decode('utf-8'))
        token = res.get('token')
        print('Login success, token:', token[:10])
        
        # PUT request
        put_url = 'https://gongmatch-production.up.railway.app/api/available-time/me'
        put_data = json.dumps({"times": [{"dayOfWeek":"MONDAY", "startTime":"09:00", "endTime":"10:00"}]}).encode('utf-8')
        put_req = urllib.request.Request(put_url, data=put_data, method='PUT', headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        })
        try:
            with urllib.request.urlopen(put_req, context=ctx) as pf:
                print('PUT status code:', pf.status)
        except urllib.error.HTTPError as e:
            print('PUT Failed:', e.code)
            print(e.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('Login failed:', e.code)
    print(e.read().decode('utf-8'))
