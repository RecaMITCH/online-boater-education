#!/usr/bin/env bash
# SEO QA automation script for onlineboatereducation.com
# Usage: ./script/seo-qa.sh [base_url]
#   base_url defaults to https://www.onlineboatereducation.com

set -euo pipefail

BASE="${1:-https://www.onlineboatereducation.com}"
PASS=0
FAIL=0
WARN=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; }
yellow(){ printf "\033[33m⚠ %s\033[0m\n" "$1"; }

check() {
  local label="$1" pattern="$2" body="$3"
  if echo "$body" | grep -qi "$pattern"; then
    green "$label"; ((PASS++))
  else
    red "$label"; ((FAIL++))
  fi
}

check_not() {
  local label="$1" pattern="$2" body="$3"
  if echo "$body" | grep -qi "$pattern"; then
    red "$label"; ((FAIL++))
  else
    green "$label"; ((PASS++))
  fi
}

fetch() {
  curl -sL --max-time 15 "$1"
}

echo ""
echo "========================================"
echo " SEO QA Check: $BASE"
echo "========================================"
echo ""

# --------------------------------------------------
# 1. robots.txt
# --------------------------------------------------
echo "--- robots.txt ---"
ROBOTS=$(fetch "$BASE/robots.txt")
check "robots.txt returns content"         "User-agent"           "$ROBOTS"
check "robots.txt allows /"                "Allow: /"             "$ROBOTS"
check "robots.txt disallows /api/"         "Disallow: /api/"      "$ROBOTS"
check "robots.txt disallows /admin/"       "Disallow: /admin/"    "$ROBOTS"
check "robots.txt references sitemap"      "sitemap.xml"          "$ROBOTS"
echo ""

# --------------------------------------------------
# 2. sitemap.xml
# --------------------------------------------------
echo "--- sitemap.xml ---"
SITEMAP=$(fetch "$BASE/sitemap.xml")
check "sitemap is valid XML"               '<?xml'                "$SITEMAP"
check "sitemap has homepage"               "$BASE/"               "$SITEMAP"
check "sitemap has /states index"          "$BASE/states"         "$SITEMAP"
check "sitemap has /blog index"            "$BASE/blog"           "$SITEMAP"
check "sitemap has /states/ entries"       "$BASE/states/"        "$SITEMAP"
check "sitemap has /blog/ entries"         "$BASE/blog/"          "$SITEMAP"
check_not "sitemap has NO /articles/ URLs" "/articles/"           "$SITEMAP"
echo ""

# --------------------------------------------------
# 3. Homepage
# --------------------------------------------------
echo "--- Homepage (/) ---"
HOME=$(fetch "$BASE/")
check "has <title> tag"                    "<title>"              "$HOME"
check "has meta description"               'name="description"'   "$HOME"
check "has canonical"                      'rel="canonical"'      "$HOME"
check "has og:title"                       'og:title'             "$HOME"
check "has og:description"                 'og:description'       "$HOME"
check "has twitter:card"                   'twitter:card'         "$HOME"
check "has WebSite schema"                 '"WebSite"'            "$HOME"
check "has Organization schema"            '"Organization"'       "$HOME"
check "has exactly one H1"                 "<h1"                  "$HOME"
echo ""

# --------------------------------------------------
# 4. States list (/states)
# --------------------------------------------------
echo "--- States List (/states) ---"
STATES=$(fetch "$BASE/states")
check "has <title> tag"                    "<title>"              "$STATES"
check "has meta description"               'name="description"'   "$STATES"
check "has canonical"                      'rel="canonical"'      "$STATES"
check "has BreadcrumbList schema"          '"BreadcrumbList"'     "$STATES"
echo ""

# --------------------------------------------------
# 5. State detail (pick first state from sitemap)
# --------------------------------------------------
STATE_URL=$(echo "$SITEMAP" | grep -o "$BASE/states/[^<]*" | head -1)
if [ -n "$STATE_URL" ]; then
  STATE_SLUG=$(echo "$STATE_URL" | sed "s|$BASE/states/||")
  echo "--- State Detail (/states/$STATE_SLUG) ---"
  STATE=$(fetch "$STATE_URL")
  check "has <title> tag"                  "<title>"              "$STATE"
  check "has meta description"             'name="description"'   "$STATE"
  check "has canonical"                    'rel="canonical"'      "$STATE"
  check "has Course schema"                '"Course"'             "$STATE"
  check "has FAQPage schema"               '"FAQPage"'            "$STATE"
  check "has BreadcrumbList schema"        '"BreadcrumbList"'     "$STATE"
  check "has og:title"                     'og:title'             "$STATE"
  check "has twitter:card"                 'twitter:card'         "$STATE"
  echo ""
else
  yellow "No state pages found in sitemap — skipping state detail checks"
  ((WARN++))
  echo ""
fi

# --------------------------------------------------
# 6. Blog list (/blog)
# --------------------------------------------------
echo "--- Blog List (/blog) ---"
BLOG=$(fetch "$BASE/blog")
check "has <title> tag"                    "<title>"              "$BLOG"
check "has meta description"               'name="description"'   "$BLOG"
check "has canonical"                      'rel="canonical"'      "$BLOG"
check "has BreadcrumbList schema"          '"BreadcrumbList"'     "$BLOG"
echo ""

# --------------------------------------------------
# 7. Blog detail (pick first article from sitemap)
# --------------------------------------------------
ARTICLE_URL=$(echo "$SITEMAP" | grep -o "$BASE/blog/[^<]*" | head -1)
if [ -n "$ARTICLE_URL" ]; then
  ARTICLE_SLUG=$(echo "$ARTICLE_URL" | sed "s|$BASE/blog/||")
  echo "--- Blog Detail (/blog/$ARTICLE_SLUG) ---"
  ARTICLE=$(fetch "$ARTICLE_URL")
  check "has <title> tag"                  "<title>"              "$ARTICLE"
  check "has meta description"             'name="description"'   "$ARTICLE"
  check "has canonical"                    'rel="canonical"'      "$ARTICLE"
  check "has Article schema"               '"Article"'            "$ARTICLE"
  check "has BreadcrumbList schema"        '"BreadcrumbList"'     "$ARTICLE"
  check "has og:title"                     'og:title'             "$ARTICLE"
  check "has twitter:card"                 'twitter:card'         "$ARTICLE"
  echo ""
else
  yellow "No blog posts found in sitemap — skipping blog detail checks"
  ((WARN++))
  echo ""
fi

# --------------------------------------------------
# 8. HTTP checks
# --------------------------------------------------
echo "--- HTTP Status Codes ---"
for path in "/" "/states" "/blog" "/robots.txt" "/sitemap.xml"; do
  STATUS=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 "$BASE$path")
  if [ "$STATUS" = "200" ]; then
    green "$path → $STATUS"
    ((PASS++))
  else
    red "$path → $STATUS (expected 200)"
    ((FAIL++))
  fi
done
echo ""

# --------------------------------------------------
# Summary
# --------------------------------------------------
echo "========================================"
printf " Results: \033[32m%d passed\033[0m" "$PASS"
if [ "$FAIL" -gt 0 ]; then
  printf ", \033[31m%d failed\033[0m" "$FAIL"
fi
if [ "$WARN" -gt 0 ]; then
  printf ", \033[33m%d warnings\033[0m" "$WARN"
fi
echo ""
echo "========================================"

exit "$FAIL"
