import os, re

setenv = 'ECHO OFF\n'

with open(r'.env', 'r') as f:
    for row in f:
        if row.startswith('#') or not '=' in row:
            continue
        else:
            key, *values = row.split('=')
            key = key.strip()
            value = re.sub(r'[\s+]', '', '='.join(values).strip())
            
            re_quote = re.match(r"^'(.*)'$", value)
            re_db_quote = re.match(r'^"(.*)"$', value)
            if re_quote:
                value = re_quote.groups()[0]
            elif re_db_quote:
                value = re_db_quote.groups()[0]
                
            if value:
                setenv += "SET {key}={value}\n".format(key=key, value=value)
            
with open(r'setenv.cmd', 'w+') as f:
    f.write(setenv)