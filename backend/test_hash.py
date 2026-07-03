import bcrypt
stored_hash = '$2b$10$sX8.eP2vJt0/qM6V3wHhruN0yK2JcMqyH6lYv/x1dF2d5PqLpE42a'
is_match = bcrypt.checkpw(b'Password@123', stored_hash.encode('utf-8'))
print("Matches Password@123:", is_match)

# Let's generate a new valid hash of 'Password@123' just in case
new_hash = bcrypt.hashpw(b'Password@123', bcrypt.gensalt()).decode('utf-8')
print("New valid hash:", new_hash)
