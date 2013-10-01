"""
  easy_install mako
"""
from fabric.api import run, local, cd, lcd, put
from fabric.operations import local as lrun
from fabric.contrib import files

import shutil, os, md5, fabric
from datetime import datetime
from collections import namedtuple


############## DONT TOUCH THIS ################

PROJECTNAME = 'hnc'
root = '/server/www/{}/'.format(PROJECTNAME)

def get_deploy_path(env, *args):
  return "{}{}/{}".format(root, env, '/'.join(args))

def getShortToken(version):
    return md5.new(version).hexdigest()

def build(env, version):
    lrun("jekyll build")
    path = get_deploy_path(env, version)
    run("mkdir -p {}".format(path))
    put("_site/*", path)

    with cd(path):
        run("~/node_modules/less/bin/lessc static/less/site.less --yui-compress static/css/site.min.css")


def switch(env, version):
    environment_path = get_deploy_path(env)
    with cd(environment_path):
        run("rm current;ln -s {} current".format(version))

def checkURLs(domain):
    result = lrun('linkchecker --no-status -a -ohtml http://{0}'.format(domain))


def deploy(env):
  VERSION_TOKEN = datetime.now().strftime("%Y%m%d-%H%M%S-%f")[:-3]
  build(env, VERSION_TOKEN)
  switch(env, VERSION_TOKEN)