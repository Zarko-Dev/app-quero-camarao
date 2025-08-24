#!/bin/bash

# Assign the filename
filename=".env"

PS3="Select shape to change status project: "

select lng in development production Exit

do
    case $lng in
        "development")
            sed -i "s/STATUS_PROJECT=production/STATUS_PROJECT=development/" $filename
            sed -i "s/STATUS_PROJECT=development/STATUS_PROJECT=development/" $filename
            exit;;
        "production")
            sed -i "s/STATUS_PROJECT=development/STATUS_PROJECT=production/" $filename
            sed -i "s/STATUS_PROJECT=production/STATUS_PROJECT=production/" $filename
            exit;;
        "Exit")
            exit;;
        *)
            exit;;
    esac
done
