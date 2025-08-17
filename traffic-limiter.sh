#!/bin/bash

# This script checks the total monthly network traffic and blocks web traffic
# if a certain quota is exceeded. It's designed to be run periodically by a cron job.

# --- Configuration ---
# The network interface to monitor. Use 'ifconfig' or 'ip a' to find the correct one.
# 'eth0' is a common default, but it might be different on your system (e.g., 'ens3').
INTERFACE="eth0"

# The traffic quota in GiB (Gibibytes). 2TB = 2048 GiB.
QUOTA_GIB=2048

# Ports to block when the quota is exceeded.
PORTS_TO_BLOCK="80,443"

# --- Logic ---

# Ensure vnStat is installed and the database for the interface is created.
if ! command -v vnstat &> /dev/null; then
    echo "vnStat is not installed. Please run 'sudo apt install vnstat' first."
    exit 1
fi

if ! vnstat -i "$INTERFACE" &> /dev/null; then
    echo "Monitoring for interface '$INTERFACE' not enabled. Enabling now..."
    sudo vnstat -i "$INTERFACE"
    echo "Waiting for initial data... Please run this script again in a minute."
    exit 1
fi

# Get the total traffic for the current month in GiB.
# We use 'tr -d " "' to remove spaces and 'cut' to get the value.
# The output format of `vnstat --oneline` is like: 1;eth0;...;...;...;...;...;...;10.12 GiB;...
# We are interested in the 9th field (total traffic for the month).
CURRENT_MONTH_TRAFFIC_GIB=$(vnstat --oneline b | cut -d';' -f9 | tr -d ' ' | sed 's/GiB//' | cut -d'.' -f1)

# Check if the traffic value is a valid number.
if ! [[ "$CURRENT_MONTH_TRAFFIC_GIB" =~ ^[0-9]+$ ]]; then
    echo "Could not parse traffic data from vnStat. It might still be collecting initial data."
    echo "Parsed value: '$CURRENT_MONTH_TRAFFIC_GIB'"
    exit 1
fi

# The iptables rule to check for. We use a comment to identify our specific rule.
IPTABLES_RULE_COMMENT="monthly-traffic-limit"
IPTABLES_CHECK_COMMAND="sudo iptables -C INPUT -p tcp -m multiport --dports ${PORTS_TO_BLOCK} -m comment --comment ${IPTABLES_RULE_COMMENT} -j DROP"

# Check if the quota has been exceeded.
if [ "$CURRENT_MONTH_TRAFFIC_GIB" -ge "$QUOTA_GIB" ]; then
    echo "Traffic quota exceeded (${CURRENT_MONTH_TRAFFIC_GIB} GiB / ${QUOTA_GIB} GiB). Blocking ports ${PORTS_TO_BLOCK}."

    # Check if the blocking rule already exists. If not, add it.
    if ! $IPTABLES_CHECK_COMMAND &> /dev/null; then
        echo "Firewall rule not found. Adding now..."
        sudo iptables -A INPUT -p tcp -m multiport --dports ${PORTS_TO_BLOCK} -m comment --comment "${IPTABLES_RULE_COMMENT}" -j DROP
    else
        echo "Firewall rule already in place."
    fi
else
    echo "Traffic quota is within limits (${CURRENT_MONTH_TRAFFIC_GIB} GiB / ${QUOTA_GIB} GiB). Ensuring ports are open."

    # Check if the blocking rule exists. If it does, remove it.
    if $IPTABLES_CHECK_COMMAND &> /dev/null; then
        echo "Firewall rule found. Removing now..."
        sudo iptables -D INPUT -p tcp -m multiport --dports ${PORTS_TO_BLOCK} -m comment --comment "${IPTABLES_RULE_COMMENT}" -j DROP
    else
        echo "Firewall rule is not in place. No action needed."
    fi
fi

exit 0
