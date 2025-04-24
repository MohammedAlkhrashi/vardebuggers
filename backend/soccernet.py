# %%
import SoccerNet
from SoccerNet.Downloader import SoccerNetDownloader
mySoccerNetDownloader=SoccerNetDownloader(LocalDirectory="soccernet/")
mySoccerNetDownloader.password = "password here!"
# %
mySoccerNetDownloader.downloadDataTask(task="tracking-2023", split=["test"])

# %%
