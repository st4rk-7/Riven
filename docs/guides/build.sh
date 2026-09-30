#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v pdflatex >/dev/null || { echo 'Install a LaTeX distribution with pdflatex first.' >&2; exit 1; }
mkdir -p build pdf
for member in dilsan hirukshanan shewon ilmam jira; do
  for pass in 1 2; do
    pdflatex -no-shell-escape -interaction=nonstopmode -halt-on-error -output-directory=build "$member.tex" >"build/$member-pass$pass.stdout" 2>&1 || {
      printf 'Build failed. Read docs/guides/build/%s-pass%s.stdout\n' "$member" "$pass" >&2
      exit 1
    }
  done
  output="$member-sprint-1.pdf"
  if [[ "$member" == jira ]]; then output="jira-working-guide.pdf"; fi
  cp "build/$member.pdf" "pdf/$output"
  printf 'Built pdf/%s\n' "$output"
done
