import glob

files = glob.glob('src/state_suite/templates/*.ts')
for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Find backticks that are not preceded by a backslash
    for i, char in enumerate(content):
        if char == '`':
            # Skip the very first and very last character (these are the template string delimiters)
            if i != 0 and i != len(content) - 1:
                # Check if it is preceded by a backslash
                if content[i-1] != '\\':
                    print(f"Found potential unescaped backtick in {file} at position {i}")
