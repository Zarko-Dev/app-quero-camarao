#!/bin/bash

# Assign the filename
filename=".env"

sed -i "s/STATUS_PROJECT=production/STATUS_PROJECT=development/" $filename
