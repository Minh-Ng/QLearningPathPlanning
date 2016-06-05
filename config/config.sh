#!/bin/bash   
cd `dirname $0`

if [ $# -ne 1 ]; then
    echo "Usage: $0 config_integer"
fi

if [[ $1 =~ ^[0-9]+$ ]]; then
    FILE="config_$1.json"

    if [ -e $FILE ]; then
        cp $FILE config.json
        echo "$FILE successfully loaded."
    else
        echo "$FILE does not exist."
    fi
else
    echo "$1 is not a positive integer."
fi
