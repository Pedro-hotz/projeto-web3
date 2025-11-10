import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

fatias = [30, 25, 20, 15, 10]
rotulos = ['A', 'B', 'C', 'D', 'E']

plt.pie(fatias, labels=rotulos, autopct='%1.1f%%', startangle=90)
plt.title("Gráfico de Pizza")
plt.show()


x = [1, 2, 3, 4, 5]
y = [1, 4, 6, 8, 10]

plt.fill_between(x, y, color="skyblue", alpha=0.4)
plt.plot(x, y, color="Slateblue", alpha=0.8)
plt.title("Gráfico de Área")
plt.show()


