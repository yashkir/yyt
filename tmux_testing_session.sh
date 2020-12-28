#!/bin/bash

# Create a new tmux session with a built:watch and server:watch pane

tmux new-session -d
tmux split-window
tmux send-keys 'yarn build:watch' 'C-m'
tmux split-window
tmux send-keys 'yarn server:watch' 'C-m'
tmux attach
