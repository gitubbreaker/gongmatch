import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://gongmatch-production.up.railway.app/api/students/seed-test'
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req, context=ctx) as f:
        print('Backend is UP! code:', f.status)
        print('Response:', f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('Other error:', str(e))
