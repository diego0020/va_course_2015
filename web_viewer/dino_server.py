import tornado.ioloop
import tornado.web
import os
import pandas as pd
import numpy as np

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("dino_map.html")

class DataHandler(tornado.web.RequestHandler):
    def get(self):
        df = self.df
        guest_id = np.random.choice(df["id"])
        guest_df = df.loc[df["id"]==guest_id]
        guest_df_list = guest_df.to_dict("records")        
        self.write({"array" :guest_df_list})

    def initialize(self):
        self.df = pd.read_csv("../../MC1 2015 Data/park-movement-Fri.csv")




settings = {"template_path" : os.path.dirname(__file__),
            "static_path" : os.path.dirname(__file__)+"static",
            "autoreload": True,
            } 

if __name__ == "__main__":
    application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/data", DataHandler),
        (r"/static/(.*)", tornado.web.StaticFileHandler,
            {"path": settings["static_path"]})

    ], **settings)
    application.listen(8100)
    tornado.ioloop.IOLoop.current().start()

