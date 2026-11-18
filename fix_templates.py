import os
import glob

files = glob.glob('src/state_suite/templates/*.ts')
for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = content.replace('\\`', '`')
    
    with open(file, 'w') as f:
        f.write(new_content)
    print(f"Fixed {file}")
